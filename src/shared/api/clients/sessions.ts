import { apiClient, validateResponse, createQueryString, withIdempotency, joinApiUrls } from '../config';
import {
  SessionSchema,
  SessionCompactSchema,
  SessionCreateDtoSchema,
  SessionUpdateDtoSchema,
  SessionBulkUpdateDtoSchema,
  SessionBulkDeleteDtoSchema,
  SessionCreationResponseSchema,
  PaginatedResponseSchema,
  SessionFiltersSchema
} from '../schemas';
import type {
  Session,
  SessionCompact,
  SessionCreateDto,
  SessionUpdateDto,
  SessionBulkUpdateDto,
  SessionBulkDeleteDto,
  SessionCreationResponse,
  PaginatedResponse,
  SessionFilters,
  IdempotencyKey
} from '../types';

/**
 * Transform session event image URLs to full URLs
 */
const transformSessionEventImages = (session: Session): Session => ({
  ...session,
  event: {
    ...session.event,
    images: session.event.images ? joinApiUrls(session.event.images) : session.event.images,
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
   * Create sessions for an event (ADMIN only)
   * POST /events/{id}/sessions
   */
  async createEventSessions(
    eventId: string,
    data: SessionCreateDto | SessionCreateDto[],
    idempotencyKey: IdempotencyKey
  ): Promise<SessionCreationResponse> {
    let validatedData;
    if (Array.isArray(data)) {
      validatedData = data.map(session => SessionCreateDtoSchema.parse(session));
    } else {
      validatedData = SessionCreateDtoSchema.parse(data);
    }

    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/events/${encodeURIComponent(eventId)}/sessions`,
      validatedData,
      config
    );
    const result = validateResponse(response.data, SessionCreationResponseSchema);

    // Transform session event image URLs
    return {
      ...result,
      items: result.items.map(transformSessionEventImages),
    };
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

  /**
   * Update session (ADMIN only)
   * PATCH /sessions/{id}
   */
  async updateSession(id: string, data: SessionUpdateDto): Promise<Session> {
    const validatedData = SessionUpdateDtoSchema.parse(data);

    const response = await apiClient.patch(
      `/sessions/${encodeURIComponent(id)}`,
      validatedData
    );
    const session = validateResponse(response.data, SessionSchema);

    // Transform session event image URLs
    return transformSessionEventImages(session);
  },

  /**
   * Cancel session (set status to CANCELLED) (ADMIN only)
   * DELETE /sessions/{id}
   */
  async cancelSession(id: string): Promise<Session> {
    const response = await apiClient.delete(`/sessions/${encodeURIComponent(id)}`);
    const session = validateResponse(response.data, SessionSchema);

    // Transform session event image URLs
    return transformSessionEventImages(session);
  },

  /**
   * Bulk update sessions (ADMIN only)
   * PATCH /sessions
   */
  async bulkUpdateSessions(
    updates: SessionBulkUpdateDto[],
    idempotencyKey: IdempotencyKey
  ): Promise<{
    items: Session[];
    updated: number;
    failed: Array<{ id: string; error: string }>;
  }> {
    const validatedUpdates = updates.map(update => SessionBulkUpdateDtoSchema.parse(update));
    const config = withIdempotency({}, idempotencyKey);

    const response = await apiClient.patch('/sessions', validatedUpdates, config);
    const result = response.data;

    // Transform session event image URLs
    return {
      ...result,
      items: result.items.map(transformSessionEventImages),
    };
  },

  /**
   * Bulk delete sessions (ADMIN only)
   * DELETE /sessions
   */
  async bulkDeleteSessions(
    data: SessionBulkDeleteDto,
    idempotencyKey: IdempotencyKey
  ): Promise<{
    deleted: string[];
    failed: Array<{ id: string; error: string }>;
  }> {
    const validatedData = SessionBulkDeleteDtoSchema.parse(data);
    const config = withIdempotency({}, idempotencyKey);

    const response = await apiClient.delete('/sessions', {
      ...config,
      data: validatedData,
    });
    return response.data;
  },
};