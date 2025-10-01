// Error messages specific to the payment page
export const ERROR_MESSAGES = {
  SESSION_NOT_FOUND: 'Данные о тренировке не найдены',
  PLAN_NOT_SELECTED: 'Выберите план подписки',
  PAYMENT_CREATION_FAILED: 'Ошибка при создании платежа',
  EXISTING_BOOKING: 'У вас уже есть активное бронирование на эту тренировку. Попробуйте обновить страницу и повторить попытку.',
  NO_SEATS_AVAILABLE: 'Нет свободных мест на эту тренировку',
  TRAINING_NOT_FOUND: 'Тренировка не найдена',
  GENERIC_PAYMENT_ERROR: 'Произошла ошибка при обработке платежа. Попробуйте снова.',
  DATA_LOADING_ERROR: 'Ошибка загрузки данных. Попробуйте обновить страницу.',
} as const;