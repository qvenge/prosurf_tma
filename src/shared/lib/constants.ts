import { COMMON_PAYMENT_ERRORS } from '@/shared/lib/payment';

/**
 * Certificate-specific payment errors
 */
export const CERTIFICATE_PAYMENT_ERRORS = {
  ...COMMON_PAYMENT_ERRORS,
  INVALID_AMOUNT: 'Неверная сумма сертификата. Проверьте введенные данные.',
  AMOUNT_TOO_LOW: 'Сумма сертификата слишком мала. Минимальная сумма: 3 000 ₽.',
  AMOUNT_TOO_HIGH: 'Сумма сертификата слишком велика.',
  MISSING_AMOUNT: 'Укажите сумму сертификата.',
  PURCHASE_FAILED: 'Не удалось приобрести сертификат. Попробуйте снова.',
} as const;

/**
 * Fixed denomination amounts (in minor units - kopecks)
 */
export const FIXED_DENOMINATIONS_MINOR = [300000, 500000, 1000000] as const; // 3000₽, 5000₽, 10000₽

/**
 * Fixed denomination amounts (in major units - rubles)
 */
export const FIXED_DENOMINATIONS = [3000, 5000, 10000] as const;

/**
 * Minimum denomination amount (in minor units - kopecks)
 */
export const MIN_DENOMINATION_MINOR = 300000; // 3000₽

/**
 * Minimum denomination amount (in major units - rubles)
 */
export const MIN_DENOMINATION = 3000;

