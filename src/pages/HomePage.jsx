/**
 * Заглушка - редирект на админку или показ ошибки
 * Пользователи попадают напрямую на /quiz/:id через бота
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        textAlign="center"
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Oprosy
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Система опросов в Telegram
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<AdminIcon />}
          onClick={() => navigate('/admin')}
        >
          Админ-панель
        </Button>
      </Box>
    </Container>
  );
}
