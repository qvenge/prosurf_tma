import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../auth';
import { handleApiError, isAuthError, isConflictError, isRateLimitError } from '../error-handler';

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      
      if (isConflictError(error)) {
        return { type: 'conflict', message: 'Email is already registered' };
      }
      
      if (isRateLimitError(error)) {
        return { type: 'rate-limit', message: 'Too many registration attempts. Please try again later.' };
      }
      
      return { type: 'validation', message: apiError.message };
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      
      if (isAuthError(error)) {
        return { type: 'auth', message: 'Invalid email or password' };
      }
      
      if (isRateLimitError(error)) {
        return { type: 'rate-limit', message: 'Too many login attempts. Please try again later.' };
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