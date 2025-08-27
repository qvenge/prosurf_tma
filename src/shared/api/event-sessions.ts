import { apiClient } from './config';
import { handleApiError } from './error-handler';
import {
  EventSessionSchema,
  GetEventSessionsQuerySchema,
  type EventSession,
  type GetEventSessionsQuery,
} from './schemas';
import { z } from 'zod';

export const eventSessionsApi = {
  getEventSessions: async (query: GetEventSessionsQuery = { offset: 0, limit: 20 }): Promise<EventSession[]> => {
    try {
      const validatedQuery = GetEventSessionsQuerySchema.parse(query);
      const params = new URLSearchParams();

      if (validatedQuery.dateFrom) {
        params.append('dateFrom', validatedQuery.dateFrom);
      }

      if (validatedQuery.dateTo) {
        params.append('dateTo', validatedQuery.dateTo);
      }

      if (validatedQuery.filters) {
        params.append('filters', JSON.stringify(validatedQuery.filters));
      }

      params.append('offset', validatedQuery.offset.toString());
      params.append('limit', validatedQuery.limit.toString());

      const response = await apiClient.get(`/event-sessions?${params.toString()}`);
      return z.array(EventSessionSchema).parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getEventSessionById: async (id: string): Promise<EventSession> => {
    try {
      const response = await apiClient.get(`/event-sessions/${encodeURIComponent(id)}`);
      return EventSessionSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};