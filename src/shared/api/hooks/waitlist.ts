import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { waitlistClient } from '../clients/waitlist';
import { sessionsKeys } from './sessions';
import type { WaitlistFilters, IdempotencyKey, PaginatedResponse, WaitlistEntry } from '../types';

export const waitlistKeys = {
  all: ['waitlist'] as const,
  userWaitlist: (userId: string, filters?: WaitlistFilters) => 
    [...waitlistKeys.all, 'user', userId, filters] as const,
} as const;

export const useJoinWaitlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, idempotencyKey }: { sessionId: string; idempotencyKey: IdempotencyKey }) => 
      waitlistClient.joinWaitlist(sessionId, idempotencyKey),
    onSuccess: (_, variables) => {
      // Update session to reflect waitlist status
      queryClient.invalidateQueries({ queryKey: sessionsKeys.detail(variables.sessionId) });
      
      // Invalidate user's waitlist
      queryClient.invalidateQueries({ queryKey: waitlistKeys.all });
    },
  });
};

export const useUserWaitlist = (userId: string, filters?: WaitlistFilters) => {
  return useQuery({
    queryKey: waitlistKeys.userWaitlist(userId, filters),
    queryFn: () => waitlistClient.getClientWaitlist(userId, filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useUserWaitlistInfinite = (userId: string, filters?: Omit<WaitlistFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: waitlistKeys.userWaitlist(userId, filters),
    queryFn: ({ pageParam }) => waitlistClient.getClientWaitlist(userId, { ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<WaitlistEntry>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCurrentUserWaitlist = () => {
  const queryClient = useQueryClient();
  const getCurrentUserId = (): string | null => {
    const authData = queryClient.getQueryData(['auth', 'user', 'profile']) as { id?: string } | undefined;
    return authData?.id || null;
  };

  const userId = getCurrentUserId();
  return useQuery({
    queryKey: waitlistKeys.userWaitlist(userId!),
    queryFn: () => waitlistClient.getClientWaitlist(userId!),
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCurrentUserWaitlistInfinite = (filters?: Omit<WaitlistFilters, 'cursor'>) => {
  const queryClient = useQueryClient();
  const getCurrentUserId = (): string | null => {
    const authData = queryClient.getQueryData(['auth', 'user', 'profile']) as { id?: string } | undefined;
    return authData?.id || null;
  };

  const userId = getCurrentUserId();
  return useInfiniteQuery({
    queryKey: waitlistKeys.userWaitlist(userId!, filters),
    queryFn: ({ pageParam }) => waitlistClient.getClientWaitlist(userId!, { ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<WaitlistEntry>) => lastPage.next,
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });
};