import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../subscriptions';
import { bookingsApi } from '../bookings';
import { useUserProfile } from './use-user';
import type { PurchaseSubscription, GetPlansQuery } from '../schemas';

export const useSubscriptionPlans = (query?: GetPlansQuery) => {
  return useQuery({
    queryKey: ['subscriptions', 'plans', query],
    queryFn: () => subscriptionsApi.getSubscriptionPlans(query),
  });
};

export const useUserSubscriptions = (userId?: string) => {
  const { data: currentUser } = useUserProfile();
  const effectiveUserId = userId || currentUser?.id;

  return useQuery({
    queryKey: ['subscriptions', 'user', effectiveUserId],
    queryFn: () => subscriptionsApi.getUserSubscriptions(effectiveUserId!),
    enabled: Boolean(effectiveUserId),
  });
};

export const useAllSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions', 'all'],
    queryFn: subscriptionsApi.getAllSubscriptions,
  });
};

export const usePurchaseSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseSubscription) => subscriptionsApi.purchaseSubscription(data),
    onSuccess: () => {
      // Invalidate subscriptions query to refetch after purchase
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

export const useRedeemSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingsApi.redeemSubscription(bookingId),
    onSuccess: () => {
      // Invalidate both subscriptions and bookings after redemption
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};