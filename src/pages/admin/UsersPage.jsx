/**
 * Страница управления пользователями
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Switch,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import api from '../../services/api';

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Ошибка авторизации. Недостаточно прав для просмотра пользователей.');
      } else if (err.response?.status === 403) {
        setError('Доступ запрещен. Только администраторы могут управлять пользователями.');
      } else {
        setError('Ошибка загрузки пользователей: ' + (err.response?.data?.detail || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}/admin`, null, {
        params: { is_admin: !currentStatus }
      });
      loadUsers();
    } catch (err) {
      if (err.response?.status === 401) {
        alert('Ошибка: Недостаточно прав. Только администраторы могут изменять статусы.');
      } else if (err.response?.status === 403) {
        alert('Ошибка: Доступ запрещен.');
      } else {
        alert('Ошибка при изменении статуса администратора');
      }
      console.error('Toggle admin error:', err);
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
          Пользователи
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление пользователями и администраторами
        </Typography>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Поиск пользователей..."
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
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell align="center">Администратор</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                        {user.first_name?.[0] || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {user.first_name} {user.last_name || ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.telegram_id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      @{user.username || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.email || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Chip
                        label="Администратор"
                        color="primary"
                        size="small"
                        icon={<AdminIcon />}
                      />
                    ) : (
                      <Chip
                        label="Пользователь"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(user.created_at).toLocaleDateString('ru-RU')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Сделать администратором">
                      <Switch
                        checked={user.is_admin}
                        onChange={() => handleToggleAdmin(user.id, user.is_admin)}
                        color="primary"
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredUsers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Пользователи не найдены
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}
