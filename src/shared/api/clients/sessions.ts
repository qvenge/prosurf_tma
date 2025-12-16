import { apiClient, validateResponse, createQueryString, joinApiUrls, joinApiUrl } from '../config';
import {
  SessionSchema,
  SessionCompactSchema,
  PaginatedResponseSchema,
  SessionFiltersSchema
} from '../schemas';
import type {
  Session,
  SessionCompact,
  PaginatedResponse,
  SessionFilters
} from '../types';

/**
 * Transform session event image URLs to full URLs
 */
const transformSessionEventImages = (session: Session): Session => ({
  ...session,
  event: {
    ...session.event,
    images: session.event.images ? joinApiUrls(session.event.images) : session.event.images,
    previewImage: joinApiUrl(session.event.previewImage),
  },
});

/**
 * Sessions API client
 */
export const sessionsClient = {
  /**
   * Get sessions for an event (returns compact format with eventId instead of full event)
   * GET /events/{id}/sessions
   */
  async getEventSessions(eventId: string, filters?: SessionFilters): Promise<PaginatedResponse<SessionCompact>> {
    const validatedFilters = SessionFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/events/${encodeURIComponent(eventId)}/sessions${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SessionCompactSchema));
  },

  /**
   * Search sessions across all events
   * GET /sessions
   */
  async getSessions(filters?: SessionFilters): Promise<PaginatedResponse<Session>> {
    const validatedFilters = SessionFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/sessions${queryString}`);
    const data = validateResponse(response.data, PaginatedResponseSchema(SessionSchema));

    // Transform session event image URLs
    return {
      ...data,
      items: data.items.map(transformSessionEventImages),
    };
  },

  /**
   * Get session by ID
   * GET /sessions/{id}
   */
  async getSessionById(id: string): Promise<Session> {
    const response = await apiClient.get(`/sessions/${encodeURIComponent(id)}`);
    const session = validateResponse(response.data, SessionSchema);

    // Transform session event image URLs
    return transformSessionEventImages(session);
  },
};