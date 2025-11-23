import { COMMON_PAYMENT_ERRORS } from '@/shared/lib/payment';

// Session payment specific error messages
export const SESSION_PAYMENT_ERRORS = {
  ...COMMON_PAYMENT_ERRORS,
  SESSION_NOT_FOUND: 'Данные о тренировке не найдены',
  PAYMENT_CREATION_FAILED: 'Ошибка при создании платежа',
  EXISTING_BOOKING: 'У вас уже есть активное бронирование на эту тренировку. Попробуйте обновить страницу и повторить попытку.',
  NO_SEATS_AVAILABLE: 'Нет свободных мест на эту тренировку',
  TRAINING_NOT_FOUND: 'Тренировка не найдена',
} as const;
