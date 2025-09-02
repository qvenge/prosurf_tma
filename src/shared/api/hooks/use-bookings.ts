import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../bookings';
import { usersApi } from '../users';
import { handleApiError, isAuthError, isConflictError, isNotFoundError, isForbiddenError } from '../error-handler';
import { useUserProfile } from './use-user';
import type { GetUserBookingsQuery } from '../schemas';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['event-sessions'] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      
      if (isAuthError(error)) {
        return { type: 'auth', message: 'Authentication required' };
      }
      
      if (isConflictError(error)) {
        return { type: 'conflict', message: 'You already have an active booking for this session or no seats available' };
      }
      
      if (isNotFoundError(error)) {
        return { type: 'not-found', message: 'Event session not found' };
      }
      
      return { type: 'validation', message: apiError.message };
    },
  });
};

export const useUserBookings = (userId?: string, query?: GetUserBookingsQuery) => {
  const { data: currentUser } = useUserProfile();
  const effectiveUserId = userId || currentUser?.id;

  return useQuery({
    queryKey: ['bookings', 'user', effectiveUserId, query],
    queryFn: () => usersApi.getUserBookings(effectiveUserId!, query),
    enabled: Boolean(effectiveUserId),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAllBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: bookingsApi.getAllBookings,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingsApi.getBookingById(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.cancelBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', data.id] });
      queryClient.invalidateQueries({ queryKey: ['event-sessions'] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      
      if (isAuthError(error)) {
        return { type: 'auth', message: 'Authentication required' };
      }
      
      if (isForbiddenError(error)) {
        return { type: 'forbidden', message: 'You can only cancel your own bookings' };
      }
      
      if (isNotFoundError(error)) {
        return { type: 'not-found', message: 'Booking not found' };
      }
      
      return { type: 'validation', message: apiError.message };
    },
  });
};

export const useRedeemSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.redeemSubscription,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', data.id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      
      if (isAuthError(error)) {
        return { type: 'auth', message: 'Authentication required' };
      }
      
      if (isNotFoundError(error)) {
        return { type: 'not-found', message: 'Booking not found' };
      }
      
      if (isConflictError(error)) {
        return { type: 'conflict', message: 'No active subscription available for this event type' };
      }
      
      return { type: 'validation', message: apiError.message };
    },
  });
};