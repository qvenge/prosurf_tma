// Common payment error messages
export const COMMON_PAYMENT_ERRORS = {
  AMOUNT_MISMATCH: 'Несоответствие суммы платежа. Попробуйте снова.',
  PROVIDER_UNAVAILABLE: 'Платежная система временно недоступна. Попробуйте позже.',
  GENERIC_PAYMENT_ERROR: 'Произошла ошибка при обработке платежа. Попробуйте снова.',
  DATA_LOADING_ERROR: 'Ошибка загрузки данных. Попробуйте обновить страницу.',
} as const;

// Season ticket / plans related errors
export const PLANS_ERRORS = {
  PLAN_NOT_SELECTED: 'Выберите план абонемента',
  PLAN_NOT_FOUND: 'План абонемента не найден',
  NO_PLANS_AVAILABLE: 'Нет доступных планов абонементов',
  PLANS_LOADING_ERROR: 'Не удалось загрузить планы абонементов',
} as const;

// Bonus related errors
export const BONUS_ERRORS = {
  BONUS_LOADING_ERROR: 'Не удалось загрузить баланс бонусов',
} as const;
