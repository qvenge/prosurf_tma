import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../auth';
import { handleApiError, isAuthError, isRateLimitError } from '../error-handler';

export const useTelegramAuth = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.authenticateWithTelegram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      
      if (isAuthError(error)) {
        return { type: 'auth', message: 'Invalid Telegram authentication data' };
      }
      
      if (isRateLimitError(error)) {
        return { type: 'rate-limit', message: 'Too many authentication attempts. Please try again later.' };
      }
      
      return { type: 'validation', message: apiError.message };
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error) => {
      authApi.clearAuth();
      queryClient.clear();
      console.error('Logout error:', error);
    },
  });
};

export const useLogoutAll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = authApi.getStoredRefreshToken();
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    },
    onSettled: () => {
      authApi.clearAuth();
      queryClient.clear();
    },
  });
};