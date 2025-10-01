export const PAYMENT_CONSTANTS = {
  CASHBACK_RATE: 0.03, // 3%
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
