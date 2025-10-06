import { apiClient, validateResponse, createQueryString, joinApiUrls } from '../config';
import {
  EventSchema,
  EventCreateDtoSchema,
  PaginatedResponseSchema,
  EventFiltersSchema
} from '../schemas';
import type {
  Event,
  EventCreateDto,
  PaginatedResponse,
  EventFilters
} from '../types';

/**
 * Transform event image URLs to full URLs
 */
const transformEventImages = (event: Event): Event => ({
  ...event,
  images: event.images ? joinApiUrls(event.images) : event.images,
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
   * Create new event (ADMIN only)
   * POST /events
   */
  async createEvent(data: EventCreateDto): Promise<Event> {
    const validatedData = EventCreateDtoSchema.parse(data);

    const response = await apiClient.post('/events', validatedData);
    const event = validateResponse(response.data, EventSchema);

    // Transform event image URLs
    return transformEventImages(event);
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