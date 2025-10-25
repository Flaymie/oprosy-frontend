/**
 * Сервис для работы с опросами
 */
import api from './api';

export const quizService = {
  // Получить все опросы (для админа)
  getAllQuizzes: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/quizzes', { params });
    return response.data;
  },

  // Получить опрос по ID
  getQuizById: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  // Создать новый опрос
  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  // Обновить опрос
  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  },

  // Удалить опрос
  deleteQuiz: async (quizId) => {
    await api.delete(`/quizzes/${quizId}`);
  },

  // Получить статистику опроса
  getQuizStats: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/stats`);
    return response.data;
  },
};
