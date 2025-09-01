import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../payments';
import { handleApiError, isAuthError, isConflictError, isNotFoundError, isForbiddenError } from '../error-handler';
import { useUserProfile } from './use-user';

export const useCreatePaymentIntent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentsApi.createPaymentIntent,
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', data.payment.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['payments', data.payment.id] });
    },
    onError: (error) => {
      const apiError = handleApiError(error);
      
      if (isAuthError(error)) {
        return { type: 'auth', message: 'Authentication required' };
      }
      
      if (isForbiddenError(error)) {
        return { type: 'forbidden', message: 'Access denied to this booking' };
      }
      
      if (isNotFoundError(error)) {
        return { type: 'not-found', message: 'Booking not found' };
      }
      
      if (isConflictError(error)) {
        return { type: 'conflict', message: 'Payment intent already exists for this booking' };
      }
      
      return { type: 'validation', message: apiError.message };
    },
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => paymentsApi.getPaymentById(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useUserPayments = (userId?: string) => {
  const { data: currentUser } = useUserProfile();
  const effectiveUserId = userId || currentUser?.id;

  return useQuery({
    queryKey: ['payments', 'user', effectiveUserId],
    queryFn: () => paymentsApi.getUserPayments(effectiveUserId!),
    enabled: Boolean(effectiveUserId),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useAllPayments = () => {
  return useQuery({
    queryKey: ['payments', 'all'],
    queryFn: paymentsApi.getAllPayments,
    staleTime: 30 * 1000, // 30 seconds
  });
};