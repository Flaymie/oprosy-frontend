import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';

// Утилиты
import { setupTelegramWebApp, getInitData, isTelegramWebApp } from './utils/telegram';
import { authService } from './services/authService';

// Страницы
import AdminPage from './pages/admin/AdminPage';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';

// Тема в молочных/белых тонах
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6B7280', // Серый
      light: '#9CA3AF',
      dark: '#4B5563',
    },
    secondary: {
      main: '#F59E0B', // Акцентный оранжевый
      light: '#FBBF24',
      dark: '#D97706',
    },
    background: {
      default: '#FAFAFA', // Молочный фон
      paper: '#FFFFFF',   // Белые карточки
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Настраиваем Telegram WebApp
      if (isTelegramWebApp()) {
        setupTelegramWebApp();
      }

      // Получаем initData
      const initData = getInitData();
      
      if (!initData) {
        // Для разработки без Telegram
        console.warn('Running without Telegram WebApp');
        setLoading(false);
        return;
      }

      // Сохраняем initData
      authService.saveInitData(initData);

      // Валидируем и получаем данные пользователя
      const userData = await authService.validateInitData(initData);
      setUser(userData);
      
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          bgcolor="background.default"
          p={3}
        >
          <div style={{ textAlign: 'center' }}>
            <h2>Ошибка инициализации</h2>
            <p>{error}</p>
          </div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/admin/*" element={<AdminPage user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
