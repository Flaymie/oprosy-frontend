/**
 * Настройки опросов - сбор контактов
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  FormGroup,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
} from '@mui/icons-material';
import api from '../../services/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    collectPhone: false,
    collectEmail: false,
    collectUsername: true,
    collectFirstName: true,
    collectLastName: false,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      setLoading(true);
      // Загружаем текущие настройки из API
      const response = await api.get('/settings');
      setSettings(response.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Доступ запрещен. Только администраторы могут просматривать настройки.');
      } else {
        setError('Ошибка загрузки данных');
      }
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = async () => {
    try {
      await api.post('/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Ошибка сохранения настроек');
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
          Настройки
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Настройка сбора данных пользователей
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Настройки сохранены
        </Alert>
      )}

      {/* Contact Collection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Сбор контактных данных
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Выберите, какие данные собирать у пользователей при прохождении опросов
          </Typography>
          <Divider sx={{ my: 3 }} />

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.collectFirstName}
                  onChange={(e) => handleChange('collectFirstName', e.target.checked)}
                />
              }
              label="Имя (First Name)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.collectLastName}
                  onChange={(e) => handleChange('collectLastName', e.target.checked)}
                />
              }
              label="Фамилия (Last Name)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.collectUsername}
                  onChange={(e) => handleChange('collectUsername', e.target.checked)}
                />
              }
              label="Username (@username)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.collectPhone}
                  onChange={(e) => handleChange('collectPhone', e.target.checked)}
                />
              }
              label="Номер телефона"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.collectEmail}
                  onChange={(e) => handleChange('collectEmail', e.target.checked)}
                />
              }
              label="Email"
            />
          </FormGroup>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Конфиденциальность
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Все собранные данные хранятся в соответствии с политикой конфиденциальности Telegram.
            Пользователи могут видеть, какие данные собираются, перед началом опроса.
          </Typography>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Сохранить настройки
        </Button>
      </Box>
    </Box>
  );
}
