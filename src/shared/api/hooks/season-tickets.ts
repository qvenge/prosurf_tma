import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { seasonTicketsClient } from '../clients/season-tickets';
import { useAuth } from '../auth';
import type {
  PaymentRequest,
  SeasonTicketPlanFilters,
  SeasonTicketFilters,
  IdempotencyKey,
  CursorParam,
  LimitParam,
  PaginatedResponse,
  SeasonTicketPlan,
  SeasonTicket
} from '../types';

export const seasonTicketsKeys = {
  all: ['season-tickets'] as const,
  plans: () => [...seasonTicketsKeys.all, 'plans'] as const,
  plansList: (filters?: SeasonTicketPlanFilters) => [...seasonTicketsKeys.plans(), 'list', filters] as const,
  plansListInfinite: (filters?: SeasonTicketPlanFilters) => [...seasonTicketsKeys.plans(), 'list', 'infinite', filters] as const,
  plan: (id: string) => [...seasonTicketsKeys.plans(), 'detail', id] as const,
  applicableEvents: (planId: string, filters?: { cursor?: CursorParam; limit?: LimitParam }) =>
    [...seasonTicketsKeys.plans(), 'detail', planId, 'applicable-events', filters] as const,
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

export const useSeasonTicketPlansInfinite = (filters?: Omit<SeasonTicketPlanFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: seasonTicketsKeys.plansListInfinite(filters),
    queryFn: ({ pageParam }) => seasonTicketsClient.getSeasonTicketPlans({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<SeasonTicketPlan>) => lastPage.next,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSeasonTicketPlan = (id: string) => {
  return useQuery({
    queryKey: seasonTicketsKeys.plan(id),
    queryFn: () => seasonTicketsClient.getSeasonTicketPlan(id),
    staleTime: 10 * 60 * 1000,
  });
};

export const useApplicableEvents = (
  planId: string,
  filters?: { cursor?: CursorParam; limit?: LimitParam }
) => {
  return useQuery({
    queryKey: seasonTicketsKeys.applicableEvents(planId, filters),
    queryFn: () => seasonTicketsClient.getApplicableEvents(planId, filters),
    staleTime: 10 * 60 * 1000,
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
      paymentMethod: PaymentRequest;
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

export const useSeasonTicketsInfinite = (filters?: Omit<SeasonTicketFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: seasonTicketsKeys.ticketsList(filters),
    queryFn: ({ pageParam }) => seasonTicketsClient.getSeasonTickets({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<SeasonTicket>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSeasonTicketsBySessionId = (sessionId?: string, filters?: SeasonTicketFilters) => {
  return useQuery({
    queryKey: seasonTicketsKeys.ticketsList({ sessionId, ...filters }),
    queryFn: () => seasonTicketsClient.getSeasonTickets({ sessionId, ...filters }),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(sessionId),
  });
};

export const useCurrentUserSeasonTickets = (filters?: SeasonTicketFilters) => {
  const auth = useAuth();
  const userId = auth.user?.id;

  return useQuery({
    queryKey: seasonTicketsKeys.ticketsList(filters),
    queryFn: () => seasonTicketsClient.getSeasonTickets(filters),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.items, // Extract items array from PaginatedResponse
  });
};