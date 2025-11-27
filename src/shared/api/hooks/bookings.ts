import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { bookingsClient } from '../clients/bookings';
import { sessionsKeys } from './sessions';
import { useAuth } from '../auth';
import type {
  Booking,
  BookRequest,
  BookingFilters,
  PaginatedResponse,
  IdempotencyKey
} from '../types';

// Query key factory for bookings
export const bookingsKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingsKeys.all, 'list'] as const,
  list: (filters?: BookingFilters) => [...bookingsKeys.lists(), filters] as const,
  details: () => [...bookingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingsKeys.details(), id] as const,
} as const;

/**
 * Bookings hooks
 */

// Book session mutation
export const useBookSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
      idempotencyKey
    }: {
      sessionId: string;
      data: BookRequest;
      idempotencyKey: IdempotencyKey;
    }) => bookingsClient.bookSession(sessionId, data, idempotencyKey),
    onSuccess: (result, variables) => {
      // Add new booking to cache
      queryClient.setQueryData(bookingsKeys.detail(result.booking.id), result.booking);

      // Invalidate bookings lists
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });

      // Invalidate and update the session to reflect reduced remaining seats
      queryClient.invalidateQueries({ queryKey: sessionsKeys.detail(variables.sessionId) });

      // Invalidate sessions lists as remainingSeats changed
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to book session:', error);
    },
  });
};

// Create deferred booking mutation (for offline/cash payments)
export const useCreateDeferredBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
      idempotencyKey
    }: {
      sessionId: string;
      data: BookRequest;
      idempotencyKey: IdempotencyKey;
    }) => bookingsClient.createDeferredBooking(sessionId, data, idempotencyKey),
    onSuccess: (booking, variables) => {
      // Add new booking to cache
      queryClient.setQueryData(bookingsKeys.detail(booking.id), booking);

      // Invalidate bookings lists
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });

      // Invalidate and update the session to reflect reduced remaining seats
      queryClient.invalidateQueries({ queryKey: sessionsKeys.detail(variables.sessionId) });

      // Invalidate sessions lists as remainingSeats changed
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create deferred booking:', error);
    },
  });
};

// Get bookings list
export const useBookings = (filters?: BookingFilters) => {
  return useQuery({
    queryKey: bookingsKeys.list(filters),
    queryFn: () => bookingsClient.getBookings(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Infinite query for bookings
export const useBookingsInfinite = (filters?: Omit<BookingFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: bookingsKeys.list(filters),
    queryFn: ({ pageParam }) => bookingsClient.getBookings({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Booking>) => lastPage.next,
    staleTime: 1 * 60 * 1000,
  });
};

// Get booking by ID
export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingsKeys.detail(id),
    queryFn: () => bookingsClient.getBookingById(id),
    staleTime: 30 * 1000, // 30 seconds (booking status changes frequently)
  });
};

// Cancel booking mutation
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => bookingsClient.cancelBooking(id),
    onSuccess: (cancelledBooking, bookingId) => {
      // Update the specific booking in cache
      queryClient.setQueryData(bookingsKeys.detail(bookingId), cancelledBooking);
      
      // Invalidate bookings lists
      queryClient.invalidateQueries({ queryKey: bookingsKeys.lists() });
      
      // Invalidate session data to reflect increased remaining seats
      queryClient.invalidateQueries({ queryKey: sessionsKeys.detail(cancelledBooking.sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionsKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to cancel booking:', error);
    },
  });
};

// Hook for current user's bookings
export const useCurrentUserBookings = () => {
  const auth = useAuth();
  const userId = auth.user?.id;

  return useQuery({
    queryKey: bookingsKeys.list(),
    queryFn: () => bookingsClient.getBookings(),
    enabled: Boolean(userId),
    staleTime: 1 * 60 * 1000,
  });
};

// Hook for current user's active bookings (HOLD or CONFIRMED)
export const useActiveBookings = () => {
  const { data, ...rest } = useCurrentUserBookings();
  
  return {
    data: data ? {
      ...data,
      items: data.items.filter(booking => 
        booking.status === 'HOLD' || booking.status === 'CONFIRMED'
      ),
    } : undefined,
    ...rest,
  };
};

// Hook for expired bookings
export const useExpiredBookings = () => {
  const { data, ...rest } = useCurrentUserBookings();
  
  return {
    data: data ? {
      ...data,
      items: data.items.filter(booking => booking.status === 'EXPIRED'),
    } : undefined,
    ...rest,
  };
};

// Hook for cancelled bookings
export const useCancelledBookings = () => {
  const { data, ...rest } = useCurrentUserBookings();
  
  return {
    data: data ? {
      ...data,
      items: data.items.filter(booking => booking.status === 'CANCELLED'),
    } : undefined,
    ...rest,
  };
};