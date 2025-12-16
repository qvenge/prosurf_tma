import { apiClient, validateResponse, createQueryString, joinApiUrls, joinApiUrl } from '../config';
import {
  EventSchema,
  PaginatedResponseSchema,
  EventFiltersSchema
} from '../schemas';
import type {
  Event,
  PaginatedResponse,
  EventFilters
} from '../types';

/**
 * Transform event image URLs to full URLs
 */
const transformEventImages = (event: Event): Event => ({
  ...event,
  images: event.images ? joinApiUrls(event.images) : event.images,
  previewImage: joinApiUrl(event.previewImage),
});

/**
 * Events API client
 */
export const eventsClient = {
  /**
   * Get events catalog with filtering and pagination
   * GET /events
   */
  async getEvents(filters?: EventFilters): Promise<PaginatedResponse<Event>> {
    const validatedFilters = EventFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/events${queryString}`);
    const data = validateResponse(response.data, PaginatedResponseSchema(EventSchema));

    // Transform event image URLs
    return {
      ...data,
      items: data.items.map(transformEventImages),
    };
  },

  /**
   * Get event by ID
   * GET /events/{id}
   */
  async getEventById(id: string): Promise<Event> {
    const response = await apiClient.get(`/events/${encodeURIComponent(id)}`);
    const event = validateResponse(response.data, EventSchema);

    // Transform event image URLs
    return transformEventImages(event);
  },
};