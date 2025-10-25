/**
 * Утилиты для работы с Telegram WebApp API
 */

// Получить объект Telegram WebApp
export const getTelegramWebApp = () => {
  return window.Telegram?.WebApp;
};

// Проверить, запущено ли приложение в Telegram
export const isTelegramWebApp = () => {
  return !!getTelegramWebApp();
};

// Получить initData
export const getInitData = () => {
  const tg = getTelegramWebApp();
  return tg?.initData || '';
};

// Получить данные пользователя из Telegram
export const getTelegramUser = () => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
};

// Настроить внешний вид WebApp
export const setupTelegramWebApp = () => {
  const tg = getTelegramWebApp();
  
  if (tg) {
    // Разворачиваем приложение на весь экран
    tg.expand();
    
    // Включаем вертикальные свайпы
    tg.enableClosingConfirmation();
    
    // Устанавливаем цвет header
    tg.setHeaderColor('#FFFFFF');
    
    // Устанавливаем цвет фона
    tg.setBackgroundColor('#FAFAFA');
  }
};

// Показать главную кнопку
export const showMainButton = (text, onClick) => {
  const tg = getTelegramWebApp();
  
  if (tg) {
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
  }
};

// Скрыть главную кнопку
export const hideMainButton = () => {
  const tg = getTelegramWebApp();
  
  if (tg) {
    tg.MainButton.hide();
  }
};

// Показать кнопку "Назад"
export const showBackButton = (onClick) => {
  const tg = getTelegramWebApp();
  
  if (tg) {
    tg.BackButton.show();
    tg.BackButton.onClick(onClick);
  }
};

// Скрыть кнопку "Назад"
export const hideBackButton = () => {
  const tg = getTelegramWebApp();
  
  if (tg) {
    tg.BackButton.hide();
  }
};

// Закрыть WebApp
export const closeTelegramWebApp = () => {
  const tg = getTelegramWebApp();
  
  if (tg) {
    tg.close();
  }
};

// Показать всплывающее уведомление
export const showAlert = (message) => {
  const tg = getTelegramWebApp();
  
  if (tg) {
    tg.showAlert(message);
  } else {
    alert(message);
  }
};

// Показать подтверждение
export const showConfirm = (message, callback) => {
  const tg = getTelegramWebApp();
  
  if (tg) {
    tg.showConfirm(message, callback);
  } else {
    const result = window.confirm(message);
    callback(result);
  }
};

// Вибрация
export const hapticFeedback = (type = 'medium') => {
  const tg = getTelegramWebApp();
  
  if (tg?.HapticFeedback) {
    switch (type) {
      case 'light':
        tg.HapticFeedback.impactOccurred('light');
        break;
      case 'medium':
        tg.HapticFeedback.impactOccurred('medium');
        break;
      case 'heavy':
        tg.HapticFeedback.impactOccurred('heavy');
        break;
      case 'success':
        tg.HapticFeedback.notificationOccurred('success');
        break;
      case 'error':
        tg.HapticFeedback.notificationOccurred('error');
        break;
      case 'warning':
        tg.HapticFeedback.notificationOccurred('warning');
        break;
      default:
        tg.HapticFeedback.impactOccurred('medium');
    }
  }
};
