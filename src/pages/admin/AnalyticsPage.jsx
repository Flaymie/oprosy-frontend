/**
 * Страница аналитики конкретного опроса
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
  Divider,
  Chip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { quizService } from '../../services/quizService';

const COLORS = ['#6B7280', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

// Карточка статистики
function StatCard({ title, value, subtitle }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h3" fontWeight={700}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizData, analyticsData] = await Promise.all([
        quizService.getQuizById(id),
        analyticsService.getQuizAnalytics(id),
      ]);
      setQuiz(quizData);
      setAnalytics(analyticsData);
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

  const handleExport = async () => {
    try {
      await analyticsService.exportQuizResponses(id);
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Ошибка авторизации. Недостаточно прав для экспорта данных.');
      } else if (err.response?.status === 403) {
        alert('Доступ запрещен. Только администраторы могут экспортировать данные.');
      } else {
        alert('Ошибка экспорта данных: ' + (err.response?.data?.detail || err.message));
      }
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/analytics')}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            {quiz?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Аналитика опроса
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Экспорт CSV
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего ответов"
            value={analytics?.total_responses || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Вопросов"
            value={quiz?.structure?.questions?.length || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Статус"
            value={
              <Chip
                label={quiz?.status === 'active' ? 'Активен' : quiz?.status === 'draft' ? 'Черновик' : 'Архив'}
                color={quiz?.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Создан"
            value={new Date(quiz?.created_at).toLocaleDateString('ru-RU')}
          />
        </Grid>
      </Grid>

      {/* Questions Analytics */}
      {analytics?.questions_stats && analytics.questions_stats.length > 0 && (
        <Box>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Статистика по вопросам
          </Typography>

          {analytics.questions_stats.map((questionStat, index) => {
            const question = quiz?.structure?.questions?.find(q => q.id === questionStat.question_id);
            
            if (!question) return null;

            return (
              <Card key={questionStat.question_id} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {index + 1}. {question.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Тип: {question.type === 'text' ? 'Текст' : question.type === 'radio' ? 'Один вариант' : question.type === 'checkbox' ? 'Несколько вариантов' : 'Шкала'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Визуализация для radio/checkbox */}
                  {(question.type === 'radio' || question.type === 'checkbox') && questionStat.answers && (
                    <Grid container spacing={3}>
                      {/* Bar Chart */}
                      <Grid item xs={12} md={7}>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={Object.entries(questionStat.answers).map(([answer, count]) => ({
                            answer,
                            count,
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="answer" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#6B7280" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Grid>

                      {/* Pie Chart */}
                      <Grid item xs={12} md={5}>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={Object.entries(questionStat.answers).map(([answer, count]) => ({
                                name: answer,
                                value: count,
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.keys(questionStat.answers).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Grid>
                    </Grid>
                  )}

                  {/* Для scale */}
                  {question.type === 'scale' && questionStat.answers && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={Object.entries(questionStat.answers)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([answer, count]) => ({
                          answer,
                          count,
                        }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="answer" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {/* Для text - показываем количество ответов */}
                  {question.type === 'text' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Получено текстовых ответов: {questionStat.total_answers || 0}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* No data */}
      {(!analytics?.questions_stats || analytics.questions_stats.length === 0) && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Пока нет данных для аналитики
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ответы появятся после прохождения опроса пользователями
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
