import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '../clients/auth';
import { authKeys, authUtils, performLogout } from '../auth';
import type {
  TelegramLoginDto,
  AuthResponse,
  RefreshRequest,
  RefreshResponse,
  User,
  Client
} from '../types';

/**
 * Authentication hooks
 */

// Telegram login mutation hook
export const useLoginWithTelegram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TelegramLoginDto) => authClient.loginWithTelegram(request),
    onSuccess: (data: AuthResponse) => {
      // Save auth data to localStorage
      authUtils.saveAuthData(data);

      // Update auth-related queries
      queryClient.setQueryData(authKeys.profile(), data.client);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Telegram login failed:', error);
    },
  });
};

// Refresh token mutation hook
export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: RefreshRequest) => authClient.refresh(request),
    onSuccess: (data: RefreshResponse) => {
      // Update tokens in localStorage
      authUtils.saveAuthData({
        ...data,
        client: queryClient.getQueryData(authKeys.profile()) as (User | Client),
      });

      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error('Token refresh failed:', error);
      performLogout();
    },
  });
};

// Logout mutation hook
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: () => {
      authUtils.clearAuthData();
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Clear local data even if logout request fails
      authUtils.clearAuthData();
      queryClient.clear();
    },
    onSettled: () => {
      // Redirect to home/login page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
  });
};

// Auto-login with Telegram Mini App
export const useTelegramAutoLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (initData?: string) => authUtils.autoLoginWithTelegram(initData),
    onSuccess: (data: AuthResponse | null) => {
      if (data) {
        authUtils.saveAuthData(data);

        // Update auth-related queries
        queryClient.setQueryData(authKeys.profile(), data.client);
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    },
    onError: (error) => {
      console.error('Telegram auto-login failed:', error);
    },
  });
};

// Query current user profile (requires authentication)
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async (): Promise<(User | Client) | null> => {
      const authState = authUtils.initializeAuth();
      return authState.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to check authentication status
export const useAuthStatus = () => {
  const { data: user, isLoading } = useCurrentUser();

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    isAdmin: user && 'role' in user ? user.role === 'ADMIN' : false,
    isUser: user && 'role' in user ? user.role === 'USER' : false,
  };
};