export const PAYMENT_CONSTANTS = {
  CURRENCY: '₽',
  MINOR_CURRENCY_DIVISOR: 100, // Convert kopecks to rubles
} as const;

export const EVENT_TYPE_LABELS = {
  surfingTraining: 'Серфинг',
  surfskateTraining: 'Серфскейт',
  tour: 'Тур',
  other: 'Другое',
} as const;

export const PRODUCT_TYPE_LABELS = {
  subscription: 'Абонемент',
  single_session: 'Разовая тренировка',
} as const;
