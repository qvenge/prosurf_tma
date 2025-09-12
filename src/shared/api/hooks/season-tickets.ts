import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seasonTicketsClient } from '../clients/season-tickets';
import type { 
  SeasonTicketPlan, 
  SeasonTicketPlanUpdateDto,
  PaymentMethodRequest,
  SeasonTicketPlanFilters,
  SeasonTicketFilters,
  IdempotencyKey 
} from '../types';

export const seasonTicketsKeys = {
  all: ['season-tickets'] as const,
  plans: () => [...seasonTicketsKeys.all, 'plans'] as const,
  plansList: (filters?: SeasonTicketPlanFilters) => [...seasonTicketsKeys.plans(), filters] as const,
  tickets: () => [...seasonTicketsKeys.all, 'tickets'] as const,
  ticketsList: (filters?: SeasonTicketFilters) => [...seasonTicketsKeys.tickets(), filters] as const,
} as const;

export const useSeasonTicketPlans = (filters?: SeasonTicketPlanFilters) => {
  return useQuery({
    queryKey: seasonTicketsKeys.plansList(filters),
    queryFn: () => seasonTicketsClient.getSeasonTicketPlans(filters),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateSeasonTicketPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SeasonTicketPlan) => seasonTicketsClient.createSeasonTicketPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonTicketsKeys.plans() });
    },
  });
};

export const useUpdateSeasonTicketPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SeasonTicketPlanUpdateDto }) => 
      seasonTicketsClient.updateSeasonTicketPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonTicketsKeys.plans() });
    },
  });
};

export const usePurchaseSeasonTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      planId, 
      paymentMethod, 
      idempotencyKey 
    }: { 
      planId: string; 
      paymentMethod: PaymentMethodRequest;
      idempotencyKey: IdempotencyKey;
    }) => seasonTicketsClient.purchaseSeasonTicket(planId, paymentMethod, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonTicketsKeys.tickets() });
    },
  });
};

export const useSeasonTickets = (filters?: SeasonTicketFilters) => {
  return useQuery({
    queryKey: seasonTicketsKeys.ticketsList(filters),
    queryFn: () => seasonTicketsClient.getSeasonTickets(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCurrentUserSeasonTickets = () => {
  const queryClient = useQueryClient();
  const getCurrentUserId = (): string | null => {
    const authData = queryClient.getQueryData(['auth', 'user', 'profile']) as { id?: string } | undefined;
    return authData?.id || null;
  };

  const userId = getCurrentUserId();
  return useQuery({
    queryKey: seasonTicketsKeys.ticketsList({ userId: userId! }),
    queryFn: () => seasonTicketsClient.getSeasonTickets({ userId: userId! }),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
};