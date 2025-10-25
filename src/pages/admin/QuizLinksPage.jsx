/**
 * Страница управления ссылками на опрос
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { hapticFeedback } from '../../utils/telegram';

export default function QuizLinksPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizData, linksData] = await Promise.all([
        api.get(`/quizzes/${id}`),
        api.get(`/links/quiz/${id}`),
      ]);
      setQuiz(quizData.data);
      setLinks(linksData.data.links || []);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    try {
      hapticFeedback('light');
      await api.post(`/links/quiz/${id}`);
      loadData();
      hapticFeedback('success');
    } catch (err) {
      alert('Ошибка создания ссылки');
    }
  };

  const handleCopyLink = (linkUuid) => {
    const botUsername = process.env.REACT_APP_BOT_USERNAME || 'your_bot';
    const link = `https://t.me/${botUsername}?start=${linkUuid}`;
    navigator.clipboard.writeText(link);
    hapticFeedback('success');
    alert(`Ссылка скопирована:\n${link}`);
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm('Удалить ссылку? Она станет недоступной.')) return;

    try {
      hapticFeedback('light');
      await api.delete(`/links/${linkId}`);
      loadData();
      hapticFeedback('success');
    } catch (err) {
      alert('Ошибка удаления ссылки');
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
        <IconButton onClick={() => navigate('/admin/quizzes')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            Ссылки на опрос
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {quiz?.title}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateLink}
        >
          Создать ссылку
        </Button>
      </Box>

      {/* Links Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>UUID</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Создана</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {link.link_uuid}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {link.is_active ? (
                      <Chip label="Активна" color="success" size="small" />
                    ) : (
                      <Chip label="Удалена" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(link.created_at).toLocaleString('ru-RU')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyLink(link.link_uuid)}
                      disabled={!link.is_active}
                    >
                      <CopyIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteLink(link.id)}
                      disabled={!link.is_active}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {links.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ссылок пока нет
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateLink}
              sx={{ mt: 2 }}
            >
              Создать первую ссылку
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
}
