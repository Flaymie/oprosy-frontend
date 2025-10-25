/**
 * API сервис для взаимодействия с backend
 */
import axios from 'axios';

// Используем относительный путь - React проксирует на localhost:8000
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const initData = localStorage.getItem('tg_init_data');
    if (initData) {
      config.headers.Authorization = `Bearer ${initData}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // НЕ редиректим при 401, просто пробрасываем ошибку
    // Компоненты сами решат что делать
    return Promise.reject(error);
  }
);

export default api;
