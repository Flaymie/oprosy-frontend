/**
 * Сервис для аутентификации
 */
import api from './api';

export const authService = {
  // Валидация initData от Telegram
  validateInitData: async (initData) => {
    const response = await api.post('/auth/validate', {
      init_data: initData,
    });
    return response.data;
  },

  // Получить текущего пользователя
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Сохранить initData в localStorage
  saveInitData: (initData) => {
    localStorage.setItem('tg_init_data', initData);
  },

  // Получить initData из localStorage
  getInitData: () => {
    return localStorage.getItem('tg_init_data');
  },

  // Очистить данные авторизации
  logout: () => {
    localStorage.removeItem('tg_init_data');
  },
};
