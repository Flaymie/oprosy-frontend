/**
 * Дашборд админ-панели - общая статистика
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  People as PeopleIcon,
  CheckCircle as CompletedIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import api from '../../services/api';

// Карточка со статистикой
function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Загружаем реальные данные из API
      const [quizzesData, usersData] = await Promise.all([
        api.get('/quizzes'),
        api.get('/users'),
      ]);
      
      const quizzes = quizzesData.data.quizzes || [];
      const users = usersData.data.users || [];
      
      // Подсчитываем статистику
      const totalQuizzes = quizzes.length;
      const activeQuizzes = quizzes.filter(q => q.status === 'active').length;
      const totalUsers = users.length;
      const totalResponses = quizzes.reduce((sum, q) => sum + (q.responses_count || 0), 0);
      
      setStats({
        totalQuizzes,
        activeQuizzes,
        totalUsers,
        totalResponses,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Ошибка авторизации. Недостаточно прав для просмотра статистики.');
      } else if (err.response?.status === 403) {
        setError('Доступ запрещен. Только администраторы могут просматривать дашборд.');
      } else {
        setError('Ошибка загрузки данных: ' + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
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
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Дашборд
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Общая статистика и аналитика
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего опросов"
            value={stats.totalQuizzes}
            icon={<QuizIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Активных опросов"
            value={stats.activeQuizzes}
            icon={<TrendingIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Пользователей"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ответов получено"
            value={stats.totalResponses}
            icon={<CompletedIcon />}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Последняя активность
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Здесь будет список последних действий и событий
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
