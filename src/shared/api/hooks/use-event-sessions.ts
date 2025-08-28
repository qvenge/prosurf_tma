import { useQuery, useInfiniteQuery, type UseQueryOptions } from '@tanstack/react-query';
import { eventSessionsApi } from '../event-sessions';
import type { EventSession, GetEventSessionsQuery } from '../schemas';

export const useEventSessions = (
  query: GetEventSessionsQuery = { offset: 0, limit: 20 },
  options?: Omit<UseQueryOptions<EventSession[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['event-sessions', query],
    queryFn: () => eventSessionsApi.getEventSessions(query),
    ...options,
  });
};

export const useInfiniteEventSessions = (
  query: Omit<GetEventSessionsQuery, 'offset'> = { limit: 20 }
) => {
  return useInfiniteQuery({
    queryKey: ['event-sessions', 'infinite', query],
    queryFn: ({ pageParam = 0 }) =>
      eventSessionsApi.getEventSessions({ ...query, offset: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const limit = query.limit || 20;
      const offset = allPages.length * limit;
      return lastPage.length === limit ? offset : undefined;
    },
    initialPageParam: 0,
  });
};

export const useEventSession = (
  id: string,
  options?: Omit<UseQueryOptions<EventSession, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['event-sessions', id],
    queryFn: () => eventSessionsApi.getEventSessionById(id),
    enabled: Boolean(id),
    ...options,
  });
};

export const useUpcomingEventSessions = (
  filters?: GetEventSessionsQuery['filters'],
  options?: Omit<UseQueryOptions<EventSession[], Error>, 'queryKey' | 'queryFn'>
) => {
  const query: GetEventSessionsQuery = {
    filters,
    offset: 0,
    limit: 20,
  };

  return useEventSessions(query, options);
};

export const useEventSessionsByType = (
  eventType: 'surfingTraining' | 'surfskateTraining' | 'tour' | 'other',
  options?: Omit<UseQueryOptions<EventSession[], Error>, 'queryKey' | 'queryFn'>
) => {
  const filters = { types: [eventType] };
  return useUpcomingEventSessions(filters, options);
};