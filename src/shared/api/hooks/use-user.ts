import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { usersApi } from '../users';
import { getAccessToken } from '../config';
import { authApi } from '../auth';
import type { User } from '../schemas';

export const useUserProfile = (
  options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: usersApi.getProfile,
    enabled: Boolean(getAccessToken()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error && 'statusCode' in error && error.statusCode === 401) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
};

export const useIsAuthenticated = () => {
  const { data: user, isLoading, error } = useUserProfile({
    retry: false,
  });

  const hasToken = Boolean(getAccessToken());
  
  // If we get a 401 error, clear the invalid token
  if (error && 'statusCode' in error && error.statusCode === 401) {
    authApi.clearAuth();
  }
  
  // Consider authenticated if:
  // 1. We have a token and user data, OR
  // 2. We have a token and we're still loading (optimistic), OR
  // 3. We have a token and the error is NOT a 401 (network/server errors)
  const isAuthenticated = hasToken && (
    Boolean(user) ||
    isLoading ||
    (error && !('statusCode' in error && error.statusCode === 401))
  );

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
  };
};

export const useUserBookingsById = (userId: string, query?: import('../schemas').GetUserBookingsQuery) => {
  return useQuery({
    queryKey: ['users', userId, 'bookings', query],
    queryFn: () => usersApi.getUserBookings(userId, query),
    enabled: Boolean(userId),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUserSubscriptionsById = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId, 'subscriptions'],
    queryFn: () => usersApi.getUserSubscriptions(userId),
    enabled: Boolean(userId),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUserPaymentsById = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId, 'payments'],
    queryFn: () => usersApi.getUserPayments(userId),
    enabled: Boolean(userId),
    staleTime: 30 * 1000, // 30 seconds
  });
};