import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { usersApi } from '../users';
import { getAccessToken } from '../config';
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

  return {
    isAuthenticated: Boolean(user && !error),
    user,
    isLoading,
    error,
  };
};

export const useUserBookingsById = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId, 'bookings'],
    queryFn: () => usersApi.getUserBookings(userId),
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