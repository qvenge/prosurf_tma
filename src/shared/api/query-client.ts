import { QueryClient } from '@tanstack/react-query';
import { handleApiError, isAuthError } from './error-handler';
import { authApi } from './auth';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          if (isAuthError(error)) {
            authApi.clearAuth();
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError: (error) => {
          const apiError = handleApiError(error);
          console.error('Mutation error:', apiError);
          
          if (isAuthError(error)) {
            authApi.clearAuth();
            window.location.reload();
          }
        },
      },
    },
  });