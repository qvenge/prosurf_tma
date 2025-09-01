import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../bookings';
import { handleApiError, isAuthError, isConflictError, isNotFoundError, isForbiddenError } from '../error-handler';
import type { CreateBooking } from '../schemas';

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

export const useUserBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getUserBookings,
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