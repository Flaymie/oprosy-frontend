/**
 * Конструктор опросов - создание и редактирование
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  IconButton,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Preview as PreviewIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { hapticFeedback } from '../../utils/telegram';

// Типы вопросов
const QUESTION_TYPES = [
  { value: 'text', label: 'Текстовый ответ' },
  { value: 'radio', label: 'Один вариант' },
  { value: 'checkbox', label: 'Несколько вариантов' },
  { value: 'scale', label: 'Шкала (1-10)' },
];

// Компонент вопроса
function QuestionEditor({ question, index, onChange, onDelete }) {
  const handleChange = (field, value) => {
    onChange(index, { ...question, [field]: value });
  };

  const handleOptionChange = (optionIndex, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[optionIndex] = value;
    handleChange('options', newOptions);
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), ''];
    handleChange('options', newOptions);
  };

  const removeOption = (optionIndex) => {
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    handleChange('options', newOptions);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DragIcon sx={{ mr: 1, color: 'text.secondary', cursor: 'grab' }} />
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            Вопрос {index + 1}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton size="small" color="error" onClick={() => onDelete(index)}>
            <DeleteIcon />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          {/* Текст вопроса */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Текст вопроса"
              value={question.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              placeholder="Введите текст вопроса"
              required
            />
          </Grid>

          {/* Тип вопроса */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Тип вопроса</InputLabel>
              <Select
                value={question.type || 'text'}
                onChange={(e) => handleChange('type', e.target.value)}
                label="Тип вопроса"
              >
                {QUESTION_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Обязательный */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={question.required || false}
                  onChange={(e) => handleChange('required', e.target.checked)}
                />
              }
              label="Обязательный вопрос"
            />
          </Grid>

          {/* Варианты ответов для radio/checkbox */}
          {(question.type === 'radio' || question.type === 'checkbox') && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Варианты ответов
              </Typography>
              {(question.options || []).map((option, optionIndex) => (
                <Box key={optionIndex} sx={{ display: 'flex', mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={option}
                    onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                    placeholder={`Вариант ${optionIndex + 1}`}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeOption(optionIndex)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={addOption}
                sx={{ mt: 1 }}
              >
                Добавить вариант
              </Button>
            </Grid>
          )}

          {/* Настройки шкалы */}
          {question.type === 'scale' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Минимум"
                  value={question.min || 1}
                  onChange={(e) => handleChange('min', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Максимум"
                  value={question.max || 10}
                  onChange={(e) => handleChange('max', parseInt(e.target.value))}
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default function QuizBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Данные опроса
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (isEditMode) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quiz = await quizService.getQuizById(id);
      setTitle(quiz.title);
      setDescription(quiz.description || '');
      setQuestions(quiz.structure?.questions || []);
      setStatus(quiz.status);
    } catch (err) {
      if (err.response?.status === 401) {
        showSnackbar('Ошибка авторизации. Недостаточно прав.', 'error');
      } else if (err.response?.status === 403) {
        showSnackbar('Доступ запрещен. Только администраторы могут редактировать опросы.', 'error');
      } else {
        showSnackbar('Ошибка загрузки опроса: ' + (err.response?.data?.detail || err.message), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleQuestionChange = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    hapticFeedback('light');
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        type: 'text',
        text: '',
        required: false,
        options: [],
      },
    ]);
  };

  const handleDeleteQuestion = (index) => {
    hapticFeedback('light');
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async (publish = false) => {
    // Валидация
    if (!title.trim()) {
      showSnackbar('Введите название опроса', 'error');
      return;
    }

    if (questions.length === 0) {
      showSnackbar('Добавьте хотя бы один вопрос', 'error');
      return;
    }

    // Проверка вопросов
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        showSnackbar(`Вопрос ${i + 1}: введите текст вопроса`, 'error');
        return;
      }
      if ((q.type === 'radio' || q.type === 'checkbox') && (!q.options || q.options.length < 2)) {
        showSnackbar(`Вопрос ${i + 1}: добавьте минимум 2 варианта ответа`, 'error');
        return;
      }
    }

    try {
      setSaving(true);
      hapticFeedback('light');

      const quizData = {
        title,
        description,
        structure: { questions },
        settings: {},
        status: publish ? 'active' : 'draft',
      };

      if (isEditMode) {
        await quizService.updateQuiz(id, quizData);
        showSnackbar('Опрос обновлен', 'success');
      } else {
        await quizService.createQuiz(quizData);
        showSnackbar('Опрос создан', 'success');
      }

      hapticFeedback('success');
      setTimeout(() => navigate('/admin/quizzes'), 1000);
    } catch (err) {
      hapticFeedback('error');
      if (err.response?.status === 401) {
        showSnackbar('Ошибка авторизации. Недостаточно прав для сохранения опроса.', 'error');
      } else if (err.response?.status === 403) {
        showSnackbar('Доступ запрещен. Только администраторы могут создавать опросы.', 'error');
      } else {
        showSnackbar('Ошибка сохранения опроса: ' + (err.response?.data?.detail || err.message), 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 3,
        gap: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <IconButton onClick={() => navigate('/admin/quizzes')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            {isEditMode ? 'Редактирование опроса' : 'Создание опроса'}
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          width: { xs: '100%', sm: 'auto' },
          flexDirection: { xs: 'column', sm: 'row' },
        }}>
          <Button
            variant="outlined"
            onClick={handleSave}
            disabled={saving}
            fullWidth
            sx={{ minWidth: { sm: 'auto' } }}
          >
            Сохранить черновик
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSave('active')}
            disabled={saving}
            fullWidth
            sx={{ minWidth: { sm: 'auto' } }}
          >
            {saving ? 'Сохранение...' : 'Опубликовать'}
          </Button>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Основная информация
              </Typography>
              <TextField
                fullWidth
                label="Название опроса"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название"
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание опроса"
                multiline
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Вопросы */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Вопросы
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
              >
                Добавить вопрос
              </Button>
            </Box>

            {questions.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Вопросов пока нет
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddQuestion}
                    sx={{ mt: 2 }}
                  >
                    Добавить первый вопрос
                  </Button>
                </CardContent>
              </Card>
            ) : (
              questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                  onChange={handleQuestionChange}
                  onDelete={handleDeleteQuestion}
                />
              ))
            )}
          </Box>
        </Grid>

        {/* Боковая панель */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Информация
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Вопросов
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {questions.length}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Статус
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {status === 'draft' ? 'Черновик' : status === 'active' ? 'Активен' : 'Архив'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
