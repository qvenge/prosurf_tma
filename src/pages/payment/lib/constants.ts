// Error messages for payment pages
export const ERROR_MESSAGES = {
  // Session payment errors
  SESSION_NOT_FOUND: 'Данные о тренировке не найдены',
  PAYMENT_CREATION_FAILED: 'Ошибка при создании платежа',
  EXISTING_BOOKING: 'У вас уже есть активное бронирование на эту тренировку. Попробуйте обновить страницу и повторить попытку.',
  NO_SEATS_AVAILABLE: 'Нет свободных мест на эту тренировку',
  TRAINING_NOT_FOUND: 'Тренировка не найдена',

  // Season ticket errors
  PLAN_NOT_SELECTED: 'Выберите план абонемента',
  PLAN_NOT_FOUND: 'План абонемента не найден',
  NO_PLANS_AVAILABLE: 'Нет доступных планов абонементов',
  PLANS_LOADING_ERROR: 'Не удалось загрузить планы абонементов',

  // Cashback errors
  CASHBACK_LOADING_ERROR: 'Не удалось загрузить баланс кэшбека',

  // Payment errors
  AMOUNT_MISMATCH: 'Несоответствие суммы платежа. Попробуйте снова.',
  PROVIDER_UNAVAILABLE: 'Платежная система временно недоступна. Попробуйте позже.',
  GENERIC_PAYMENT_ERROR: 'Произошла ошибка при обработке платежа. Попробуйте снова.',
  DATA_LOADING_ERROR: 'Ошибка загрузки данных. Попробуйте обновить страницу.',
} as const;