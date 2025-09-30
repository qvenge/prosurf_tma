import { ApiErrorClass } from './config';
import type { ApiError } from './types';

// Type guards for different error types
export const isApiError = (error: unknown): error is ApiErrorClass => {
  return error instanceof ApiErrorClass;
};

export const isAuthError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 401;
};

export const isForbiddenError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 403;
};

export const isNotFoundError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 404;
};

export const isConflictError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 409;
};

export const isValidationError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 422;
};

export const isNetworkError = (error: unknown): boolean => {
  return isApiError(error) && error.status === 0;
};

export const isServerError = (error: unknown): boolean => {
  return isApiError(error) && error.status >= 500;
};

// Specific business error type guards
export const isHoldExpiredError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'HOLD_EXPIRED';
};

export const isNoSeatsError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'NO_SEATS';
};

export const isAmountMismatchError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'AMOUNT_MISMATCH';
};

export const isDuplicatePaymentError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'DUPLICATE_PAYMENT';
};

export const isProviderUnavailableError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'PROVIDER_UNAVAILABLE';
};

// Payment-specific error type guards
export const isInvoiceCreationFailedError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'INVOICE_CREATION_FAILED';
};

export const isInvoicePaymentFailedError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'INVOICE_PAYMENT_FAILED';
};

export const isInvoiceCancelledError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'INVOICE_CANCELLED';
};

export const isPaymentProviderError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'PAYMENT_PROVIDER_ERROR';
};

export const isInvalidCurrencyError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'INVALID_CURRENCY';
};

export const isPaymentTimeoutError = (error: unknown): boolean => {
  return isApiError(error) && error.error.code === 'PAYMENT_TIMEOUT';
};

// Error message extraction
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorCode = (error: unknown): string | null => {
  if (isApiError(error)) {
    return error.error.code;
  }
  
  return null;
};

export const getErrorDetails = (error: unknown): unknown => {
  if (isApiError(error)) {
    return error.error.details;
  }
  
  return null;
};

// User-friendly error messages
const ERROR_MESSAGES: Record<ApiError['code'], string> = {
  HOLD_EXPIRED: 'Время бронирования истекло. Пожалуйста, забронируйте снова.',
  NO_SEATS: 'К сожалению, места закончились.',
  AMOUNT_MISMATCH: 'Сумма платежа не совпадает. Попробуйте снова.',
  DUPLICATE_PAYMENT: 'Этот платеж уже был обработан.',
  PROVIDER_UNAVAILABLE: 'Сервис временно недоступен. Попробуйте позже.',
  INVALID_CREDENTIALS: 'Неверные учетные данные.',
  USER_EXISTS: 'Пользователь с такими данными уже существует.',
  WEAK_PASSWORD: 'Пароль слишком слабый.',
  INVALID_EMAIL: 'Неверный формат email.',
  HAS_ACTIVE_BOOKINGS: 'У пользователя есть активные бронирования.',
  HAS_ACTIVE_SESSIONS: 'У пользователя есть активные сессии.',
  // Payment-specific error messages
  INVOICE_CREATION_FAILED: 'Не удалось создать счёт для оплаты. Попробуйте позже.',
  INVOICE_PAYMENT_FAILED: 'Платёж был отклонён. Проверьте данные карты или используйте другой способ оплаты.',
  INVOICE_CANCELLED: 'Вы отменили платёж. Попробуйте снова, если это было сделано случайно.',
  PAYMENT_PROVIDER_ERROR: 'Ошибка настройки платёжной системы. Свяжитесь с поддержкой.',
  INVALID_CURRENCY: 'Выбранный способ оплаты не поддерживает данную валюту. Попробуйте другой способ.',
  PAYMENT_TIMEOUT: 'Время ожидания платежа истекло. Попробуйте снова.',
};

export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    const friendlyMessage = ERROR_MESSAGES[error.error.code];
    if (friendlyMessage) {
      return friendlyMessage;
    }
    return error.error.message;
  }
  
  if (isNetworkError(error)) {
    return 'Проблемы с подключением к интернету. Проверьте соединение и попробуйте снова.';
  }
  
  if (isServerError(error)) {
    return 'Сервис временно недоступен. Попробуйте позже.';
  }
  
  return getErrorMessage(error);
};

// Error logging utility
export const logError = (error: unknown, context?: string): void => {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  const details = getErrorDetails(error);
  
  console.error('API Error:', {
    message,
    code,
    details,
    context,
    timestamp: new Date().toISOString(),
    ...(isApiError(error) && {
      status: error.status,
      statusText: error.statusText,
    }),
  });
};

// Retry utilities
export const shouldRetry = (error: unknown): boolean => {
  if (isApiError(error)) {
    // Retry on server errors and specific provider unavailable errors
    return isServerError(error) || isProviderUnavailableError(error);
  }
  
  return isNetworkError(error);
};

export const getRetryDelay = (attemptNumber: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
  return Math.min(1000 * Math.pow(2, attemptNumber), 16000);
};

// Error boundary helpers
export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  canRetry: boolean;
  shouldShowToUser: boolean;
}

export const getErrorInfo = (error: unknown): ErrorInfo => {
  if (isApiError(error)) {
    return {
      message: getUserFriendlyErrorMessage(error),
      code: error.error.code,
      status: error.status,
      canRetry: shouldRetry(error),
      shouldShowToUser: !isAuthError(error), // Don't show auth errors to user
    };
  }
  
  return {
    message: getUserFriendlyErrorMessage(error),
    canRetry: shouldRetry(error),
    shouldShowToUser: true,
  };
};

// React error boundary component data
export const createErrorBoundaryProps = (error: unknown) => ({
  error: getErrorInfo(error),
  onRetry: shouldRetry(error) ? () => window.location.reload() : undefined,
  showContactSupport: isServerError(error),
});

// Hook for handling errors in components
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    logError(error, context);
    
    const errorInfo = getErrorInfo(error);
    
    // Handle specific error types
    if (isAuthError(error)) {
      // Auth errors are already handled by axios interceptor
      return;
    }
    
    if (errorInfo.shouldShowToUser) {
      // In a real app, this would be connected to a toast/notification system
      console.warn('Error to show to user:', errorInfo.message);
    }
    
    return errorInfo;
  };
  
  return {
    handleError,
    isApiError,
    isAuthError,
    isForbiddenError,
    isNotFoundError,
    isConflictError,
    isValidationError,
    isNetworkError,
    isServerError,
    isHoldExpiredError,
    isNoSeatsError,
    isAmountMismatchError,
    isDuplicatePaymentError,
    isProviderUnavailableError,
    // Payment-specific error type guards
    isInvoiceCreationFailedError,
    isInvoicePaymentFailedError,
    isInvoiceCancelledError,
    isPaymentProviderError,
    isInvalidCurrencyError,
    isPaymentTimeoutError,
    getErrorMessage,
    getUserFriendlyErrorMessage,
    shouldRetry,
  };
};