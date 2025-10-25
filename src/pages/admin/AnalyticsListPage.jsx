/**
 * Список опросов для аналитики
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';

// Карточка опроса с кратким обзором
function QuizAnalyticsCard({ quiz, onClick }) {
  const completionRate = quiz.structure?.questions?.length 
    ? Math.round((quiz.responses_count || 0) / Math.max(quiz.structure.questions.length, 1) * 100)
    : 0;

  return (
    <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {quiz.title}
          </Typography>
          <Chip
            label={quiz.status === 'active' ? 'Активен' : quiz.status === 'draft' ? 'Черновик' : 'Архив'}
            color={quiz.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        </Box>

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

        <Grid container spacing={2} mb={2}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Ответов
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {quiz.responses_count || 0}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Вопросов
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {quiz.structure?.questions?.length || 0}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary">
              Заполнено
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {completionRate}%
            </Typography>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Прогресс заполнения
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(completionRate, 100)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<BarChartIcon />}
          sx={{ mt: 2 }}
        >
          Подробная аналитика
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      // Фильтруем только активные и архивные (не черновики)
      const publishedQuizzes = (data.quizzes || []).filter(q => q.status !== 'draft');
      setQuizzes(publishedQuizzes);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Ошибка авторизации. Недостаточно прав для просмотра аналитики.');
      } else if (err.response?.status === 403) {
        setError('Доступ запрещен. Только администраторы могут просматривать аналитику.');
      } else {
        setError('Ошибка загрузки данных: ' + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuizClick = (quizId) => {
    navigate(`/admin/analytics/${quizId}`);
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
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Аналитика
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Статистика и результаты опросов
        </Typography>
      </Box>

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <TrendingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Нет опубликованных опросов
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Опубликуйте опросы, чтобы увидеть аналитику
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/admin/quizzes')}
            >
              Перейти к опросам
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
              <QuizAnalyticsCard
                quiz={quiz}
                onClick={() => handleQuizClick(quiz.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
