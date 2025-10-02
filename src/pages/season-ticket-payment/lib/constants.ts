// Error messages specific to season ticket payment page
export const ERROR_MESSAGES = {
  PLAN_NOT_SELECTED: 'Выберите план абонемента',
  PLAN_NOT_FOUND: 'План абонемента не найден',
  NO_PLANS_AVAILABLE: 'Нет доступных планов абонементов',
  AMOUNT_MISMATCH: 'Несоответствие суммы платежа. Попробуйте снова.',
  PROVIDER_UNAVAILABLE: 'Платежная система временно недоступна. Попробуйте позже.',
  GENERIC_PAYMENT_ERROR: 'Произошла ошибка при обработке платежа. Попробуйте снова.',
  DATA_LOADING_ERROR: 'Ошибка загрузки данных. Попробуйте обновить страницу.',
} as const;