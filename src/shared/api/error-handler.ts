import { AxiosError } from 'axios';
import { ApiErrorSchema } from './schemas';

export class ProSurfApiError extends Error {
  public readonly statusCode: number;
  public readonly apiError: string;

  constructor(statusCode: number, apiError: string, message: string) {
    super(message);
    this.name = 'ProSurfApiError';
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

export const handleApiError = (error: unknown): ProSurfApiError => {
  console.log('REQUEST ERROR:', error);

  if (error instanceof AxiosError) {
    if (error.response?.data) {
      try {
        const apiError = ApiErrorSchema.parse(error.response.data);
        return new ProSurfApiError(apiError.statusCode, apiError.error, apiError.message);
      } catch {
        return new ProSurfApiError(
          error.response.status,
          'Unknown API Error',
          'An unexpected error occurred'
        );
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new ProSurfApiError(408, 'Timeout', 'Request timeout');
    }

    if (error.code === 'ERR_NETWORK') {
      return new ProSurfApiError(0, 'Network Error', 'Network connection failed');
    }

    return new ProSurfApiError(
      error.response?.status || 0,
      'Request Failed',
      error.message || 'Request failed'
    );
  }

  if (error instanceof Error) {
    return new ProSurfApiError(0, 'Unknown Error', error.message);
  }

  return new ProSurfApiError(0, 'Unknown Error', 'An unknown error occurred');
};

export const getErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  return apiError.message;
};

export const isAuthError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 401;
};

export const isValidationError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 400;
};

export const isConflictError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 409;
};

export const isRateLimitError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 429;
};

export const isNotFoundError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 404;
};

export const isForbiddenError = (error: unknown): boolean => {
  const apiError = handleApiError(error);
  return apiError.statusCode === 403;
};