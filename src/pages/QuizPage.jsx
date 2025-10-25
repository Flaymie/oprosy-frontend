/**
 * Страница прохождения опроса
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Slider,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { responseService } from '../services/responseService';
import { hapticFeedback, showMainButton, hideMainButton } from '../utils/telegram';
import api from '../services/api';

// Компонент вопроса
function QuestionView({ question, answer, onChange }) {
  const handleChange = (value) => {
    onChange(question.id, value);
    hapticFeedback('light');
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {question.text}
      </Typography>

      {question.required && (
        <Typography variant="caption" color="error" gutterBottom display="block">
          * Обязательный вопрос
        </Typography>
      )}

      <Box mt={3}>
        {/* Text input */}
        {question.type === 'text' && (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answer || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Введите ваш ответ"
            variant="outlined"
          />
        )}

        {/* Radio buttons */}
        {question.type === 'radio' && (
          <RadioGroup value={answer || ''} onChange={(e) => handleChange(e.target.value)}>
            {(question.options || []).map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
                sx={{
                  mb: 1,
                  p: 2,
                  border: '1px solid',
                  borderColor: answer === option ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: answer === option ? 'primary.light' : 'transparent',
                }}
              />
            ))}
          </RadioGroup>
        )}

        {/* Checkboxes */}
        {question.type === 'checkbox' && (
          <FormGroup>
            {(question.options || []).map((option, index) => {
              const isChecked = Array.isArray(answer) && answer.includes(option);
              return (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => {
                        const currentAnswers = Array.isArray(answer) ? [...answer] : [];
                        if (e.target.checked) {
                          handleChange([...currentAnswers, option]);
                        } else {
                          handleChange(currentAnswers.filter(a => a !== option));
                        }
                      }}
                    />
                  }
                  label={option}
                  sx={{
                    mb: 1,
                    p: 2,
                    border: '1px solid',
                    borderColor: isChecked ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    bgcolor: isChecked ? 'primary.light' : 'transparent',
                  }}
                />
              );
            })}
          </FormGroup>
        )}

        {/* Scale slider */}
        {question.type === 'scale' && (
          <Box px={2}>
            <Slider
              value={answer || question.min || 1}
              onChange={(e, value) => handleChange(value)}
              min={question.min || 1}
              max={question.max || 10}
              step={1}
              marks
              valueLabelDisplay="on"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {question.min || 1}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {question.max || 10}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadQuiz();
    return () => hideMainButton();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      
      const quizData = await quizService.getQuizById(id);
      setQuiz(quizData);
      
      // Убрали проверку существующих ответов - пока не работает без авторизации
      
    } catch (err) {
        if (err.response?.status === 401) {
            setError('Ошибка авторизации. Недостаточно прав для просмотра.');
          } else if (err.response?.status === 403) {
            setError('Доступ запрещен.');
          } else {
            setError('Ошибка загрузки данных: ' + (err.response?.data?.detail || err.message));
          }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const validateCurrentQuestion = () => {
    const currentQuestion = quiz.structure.questions[currentQuestionIndex];
    
    if (currentQuestion.required) {
      const answer = answers[currentQuestion.id];
      
      if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === '') {
        showSnackbar('Пожалуйста, ответьте на обязательный вопрос', 'error');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    if (currentQuestionIndex < quiz.structure.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      hapticFeedback('light');
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      hapticFeedback('light');
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    try {
      setSubmitting(true);
      hapticFeedback('light');
      
      await responseService.submitResponse(parseInt(id), answers);
      
      hapticFeedback('success');
      showSnackbar('Спасибо! Ваши ответы сохранены', 'success');
      
      // Не редиректим - просто показываем сообщение
      // setTimeout(() => {
      //   navigate('/');
      // }, 2000);
    } catch (err) {
      hapticFeedback('error');
      showSnackbar('Ошибка отправки ответов', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box py={4}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Вернуться назад
          </Button>
        </Box>
      </Container>
    );
  }

  if (!quiz || !quiz.structure?.questions || quiz.structure.questions.length === 0) {
    return (
      <Container maxWidth="md">
        <Box py={4}>
          <Alert severity="warning">Опрос не содержит вопросов</Alert>
        </Box>
      </Container>
    );
  }

  const currentQuestion = quiz.structure.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.structure.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.structure.questions.length - 1;

  return (
    <Container maxWidth="md">
      <Box py={4}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {quiz.title}
          </Typography>
          {quiz.description && (
            <Typography variant="body1" color="text.secondary">
              {quiz.description}
            </Typography>
          )}
        </Box>

        {/* Progress */}
        <Box mb={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Вопрос {currentQuestionIndex + 1} из {quiz.structure.questions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        {/* Question Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <QuestionView
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onChange={handleAnswerChange}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            sx={{ flex: 1 }}
          >
            Назад
          </Button>
          
          {isLastQuestion ? (
            <Button
              variant="contained"
              endIcon={<CompleteIcon />}
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ flex: 1 }}
            >
              {submitting ? 'Отправка...' : 'Завершить'}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<NextIcon />}
              onClick={handleNext}
              sx={{ flex: 1 }}
            >
              Далее
            </Button>
          )}
        </Box>
      </Box>

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
    </Container>
  );
}
