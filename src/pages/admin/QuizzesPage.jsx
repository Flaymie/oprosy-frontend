/**
 * Страница управления опросами - список всех опросов
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  BarChart as StatsIcon,
  Search as SearchIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { showConfirm, hapticFeedback } from '../../utils/telegram';
import api from '../../services/api';

// Карточка опроса
function QuizCard({ quiz, onEdit, onDelete, onViewStats, onCopyLink }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'draft':
        return 'Черновик';
      case 'archived':
        return 'Архив';
      default:
        return status;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            label={getStatusText(quiz.status)}
            color={getStatusColor(quiz.status)}
            size="small"
          />
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleMenuClose(); onEdit(quiz); }}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Редактировать
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onViewStats(quiz); }}>
              <StatsIcon fontSize="small" sx={{ mr: 1 }} />
              Статистика
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onCopyLink(quiz); }}>
              <LinkIcon fontSize="small" sx={{ mr: 1 }} />
              Создать ссылку
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); window.location.href = `/admin/quizzes/${quiz.id}/links`; }}>
              <LinkIcon fontSize="small" sx={{ mr: 1 }} />
              Управление ссылками
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); onDelete(quiz); }} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Удалить
            </MenuItem>
          </Menu>
        </Box>

        {/* Title */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {quiz.title}
        </Typography>

        {/* Description */}
        {quiz.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {quiz.description}
          </Typography>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Вопросов
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {quiz.structure?.questions?.length || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Ответов
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {quiz.responses_count || 0}
            </Typography>
          </Box>
        </Box>

        {/* Date */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Создан: {new Date(quiz.created_at).toLocaleDateString('ru-RU')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizzes, searchQuery, statusFilter]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Ошибка авторизации. Недостаточно прав для просмотра опросов.');
      } else if (err.response?.status === 403) {
        setError('Доступ запрещен. Только администраторы могут управлять опросами.');
      } else {
        setError('Ошибка загрузки опросов: ' + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = quizzes;

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    // Поиск
    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredQuizzes(filtered);
  };

  const handleCreateQuiz = () => {
    hapticFeedback('light');
    navigate('/admin/quizzes/create');
  };

  const handleEditQuiz = (quiz) => {
    hapticFeedback('light');
    navigate(`/admin/quizzes/${quiz.id}/edit`);
  };

  const handleDeleteQuiz = async (quiz) => {
    showConfirm(
      `Вы уверены, что хотите удалить опрос "${quiz.title}"?`,
      async (confirmed) => {
        if (confirmed) {
          try {
            await quizService.deleteQuiz(quiz.id);
            hapticFeedback('success');
            loadQuizzes();
          } catch (err) {
            hapticFeedback('error');
            alert('Ошибка при удалении опроса');
          }
        }
      }
    );
  };

  const handleViewStats = (quiz) => {
    hapticFeedback('light');
    navigate(`/admin/analytics/${quiz.id}`);
  };

  const handleCopyLink = async (quiz) => {
    try {
      const botUsername = process.env.REACT_APP_BOT_USERNAME || 'musicvlkpyt_bot';
      const link = `https://t.me/${botUsername}?start=${quiz.id}`;
      
      navigator.clipboard.writeText(link);
      hapticFeedback('success');
      alert(`Ссылка скопирована:\n${link}`);
    } catch (err) {
      hapticFeedback('error');
      alert('Ошибка копирования ссылки');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: 2,
      }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Опросы
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/quizzes/create')}
          fullWidth
          sx={{ maxWidth: { sm: '200px' } }}
        >
          Создать опрос
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Поиск опросов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Tabs
                value={statusFilter}
                onChange={(e, value) => setStatusFilter(value)}
                variant="fullWidth"
              >
                <Tab label="Все" value="all" />
                <Tab label="Активные" value="active" />
                <Tab label="Черновики" value="draft" />
                <Tab label="Архив" value="archived" />
              </Tabs>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quiz List */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Опросы не найдены
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Создайте свой первый опрос
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateQuiz}
            >
              Создать опрос
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredQuizzes.map((quiz) => (
            <Grid item xs={12} sm={6} lg={4} key={quiz.id}>
              <QuizCard
                quiz={quiz}
                onEdit={handleEditQuiz}
                onDelete={handleDeleteQuiz}
                onViewStats={handleViewStats}
                onCopyLink={handleCopyLink}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
