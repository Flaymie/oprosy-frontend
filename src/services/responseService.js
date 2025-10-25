/**
 * Сервис для работы с ответами на опросы
 */
import api from './api';

export const responseService = {
  // Отправить ответы на опрос
  submitResponse: async (quizId, answers) => {
    const response = await api.post('/responses', {
      quiz_id: quizId,
      answers: answers,
    });
    return response.data;
  },

  // Получить все ответы по опросу (для админа)
  getQuizResponses: async (quizId) => {
    const response = await api.get(`/responses/${quizId}`);
    return response.data;
  },

  // Получить свой ответ на опрос
  getMyResponse: async (quizId) => {
    try {
      const response = await api.get(`/responses/my/${quizId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Пользователь еще не проходил опрос
      }
      throw error;
    }
  },
};
