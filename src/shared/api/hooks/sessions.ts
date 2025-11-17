import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { sessionsClient } from '../clients/sessions';
import { eventsKeys } from './events';
import { SESSION_START_DATE } from '@/shared/lib/date-utils';
import type {
  Session,
  SessionCompact,
  SessionFilters,
  PaginatedResponse
} from '../types';

// Query key factory for sessions
export const sessionsKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionsKeys.all, 'list'] as const,
  list: (filters?: SessionFilters) => [...sessionsKeys.lists(), filters] as const,
  details: () => [...sessionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionsKeys.details(), id] as const,
  eventSessions: (eventId: string, filters?: SessionFilters) => 
    [...eventsKeys.detail(eventId), 'sessions', filters] as const,
} as const;

/**
 * Sessions hooks
 */

// Get sessions for an event
export const useEventSessions = (eventId: string, filters?: SessionFilters) => {
  return useQuery({
    queryKey: sessionsKeys.eventSessions(eventId, filters),
    queryFn: () => sessionsClient.getEventSessions(eventId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Infinite query for event sessions
export const useEventSessionsInfinite = (
  eventId: string,
  filters?: Omit<SessionFilters, 'cursor'>
) => {
  return useInfiniteQuery({
    queryKey: sessionsKeys.eventSessions(eventId, filters),
    queryFn: ({ pageParam }) =>
      sessionsClient.getEventSessions(eventId, { ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<SessionCompact>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

// Search sessions across all events
export const useSessions = (filters?: SessionFilters) => {
  return useQuery({
    queryKey: sessionsKeys.list(filters),
    queryFn: () => sessionsClient.getSessions(filters),
    staleTime: 2 * 60 * 1000,
  });
};

// Infinite query for sessions search
export const useSessionsInfinite = (filters?: Omit<SessionFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: sessionsKeys.list(filters),
    queryFn: ({ pageParam }) => sessionsClient.getSessions({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Session>) => lastPage.next,
    staleTime: 2 * 60 * 1000,
  });
};

// Get session by ID
export const useSession = (id: string) => {
  return useQuery({
    queryKey: sessionsKeys.detail(id),
    queryFn: () => sessionsClient.getSessionById(id),
    staleTime: 1 * 60 * 1000, // 1 minute (session data changes frequently)
  });
};

// Hook for upcoming sessions
export const useUpcomingSessions = (limit: number = 20) => {
  const filters: SessionFilters = {
    startsAfter: SESSION_START_DATE,
    limit,
  };

  return useQuery({
    queryKey: sessionsKeys.list(filters),
    queryFn: () => sessionsClient.getSessions(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Hook for available sessions (with seats)
export const useAvailableSessions = (filters?: Omit<SessionFilters, 'cursor'>) => {
  return useQuery({
    queryKey: sessionsKeys.list({ ...filters, startsAfter: SESSION_START_DATE }),
    queryFn: () => sessionsClient.getSessions({ ...filters, startsAfter: SESSION_START_DATE }),
    select: (data) => ({
      ...data,
      items: data.items.filter(session => session.remainingSeats > 0),
    }),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};