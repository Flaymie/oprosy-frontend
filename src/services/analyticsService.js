/**
 * Сервис для работы с аналитикой
 */
import api from './api';

export const analyticsService = {
  // Получить аналитику опроса
  getQuizAnalytics: async (quizId) => {
    const response = await api.get(`/analytics/${quizId}`);
    return response.data;
  },

  // Экспортировать ответы в CSV
  exportQuizResponses: async (quizId) => {
    const response = await api.get(`/analytics/${quizId}/export`, {
      responseType: 'blob',
    });
    
    // Создаем ссылку для скачивания
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quiz_${quizId}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
