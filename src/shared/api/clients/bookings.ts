import { apiClient, validateResponse, createQueryString, withIdempotency, joinApiUrls, joinApiUrl } from '../config';
import {
  BookingSchema,
  BookingExtendedSchema,
  BookingCreateDtoSchema,
  BookRequestSchema,
  PaginatedResponseSchema,
  BookingFiltersSchema
} from '../schemas';
import type {
  Booking,
  BookingExtended,
  BookingCreateDto,
  BookRequest,
  BookingWithHoldTTL,
  PaginatedResponse,
  BookingFilters,
  IdempotencyKey
} from '../types';

/**
 * Transform BookingExtended URLs (session.event.images and user.photoUrl)
 */
const transformBookingExtended = (booking: BookingExtended): BookingExtended => {
  const result = { ...booking };

  // Transform session.event.images if session exists
  if (result.session) {
    result.session = {
      ...result.session,
      event: {
        ...result.session.event,
        images: result.session.event.images
          ? joinApiUrls(result.session.event.images)
          : result.session.event.images,
      },
    };
  }

  // Transform user.photoUrl if user exists
  if (result.user) {
    result.user = {
      ...result.user,
      photoUrl: joinApiUrl(result.user.photoUrl),
    };
  }

  return result;
};

/**
 * Bookings API client
 *
 * Manages session bookings including creation, retrieval, cancellation, and confirmation.
 * Bookings start in HOLD status and must be paid within the hold TTL period.
 */
export const bookingsClient = {
  /**
   * Book seats in a session (supports both user and admin bookings)
   * POST /sessions/{id}/book
   *
   * Creates a booking for the specified session. Behavior depends on user role:
   * - USER: Creates HOLD booking for current user
   * - ADMIN: Can create bookings for any user or guest, can set status to CONFIRMED
   *
   * @param sessionId - The ID of the session to book
   * @param data - Booking request (BookRequest for users, BookingCreateDto for admins)
   * @param idempotencyKey - Unique key for request idempotency (8-128 chars)
   * @returns Promise resolving to booking data with hold TTL information
   */
  async bookSession(
    sessionId: string,
    data: BookRequest | BookingCreateDto,
    idempotencyKey: IdempotencyKey
  ): Promise<BookingWithHoldTTL> {
    // Try to parse as admin DTO first, fallback to simple request
    let validatedData;
    let isExtended = false;

    try {
      validatedData = BookingCreateDtoSchema.parse(data);
      isExtended = true;
    } catch {
      validatedData = BookRequestSchema.parse(data);
    }

    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/sessions/${encodeURIComponent(sessionId)}/book`,
      validatedData,
      config
    );

    const booking = isExtended
      ? validateResponse(response.data, BookingExtendedSchema)
      : validateResponse(response.data, BookingSchema);
    const holdTtlSeconds = response.headers['x-hold-ttl']
      ? parseInt(response.headers['x-hold-ttl'] as string, 10)
      : null;

    return {
      booking,
      holdTtlSeconds,
    };
  },

  /**
   * Simple booking method for regular users
   * POST /sessions/{id}/book
   */
  async createBooking(
    sessionId: string,
    data: BookRequest,
    idempotencyKey: IdempotencyKey
  ): Promise<BookingWithHoldTTL> {
    return this.bookSession(sessionId, data, idempotencyKey);
  },

  /**
   * Admin booking method with full capabilities
   * POST /sessions/{id}/book
   */
  async createAdminBooking(
    sessionId: string,
    data: BookingCreateDto,
    idempotencyKey: IdempotencyKey
  ): Promise<BookingWithHoldTTL> {
    return this.bookSession(sessionId, data, idempotencyKey);
  },

  /**
   * Get list of bookings (self or ADMIN with advanced filtering)
   * GET /bookings
   */
  async getBookings(filters?: BookingFilters): Promise<PaginatedResponse<Booking | BookingExtended>> {
    const validatedFilters = BookingFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/bookings${queryString}`);

    // If any include flags are set, return BookingExtended
    const shouldReturnExtended = validatedFilters.includeUser ||
                                 validatedFilters.includeSession ||
                                 validatedFilters.includePaymentInfo ||
                                 validatedFilters.includeGuestContact;

    const schema = shouldReturnExtended ? BookingExtendedSchema : BookingSchema;
    const data = validateResponse(response.data, PaginatedResponseSchema(schema));

    // Transform URLs for BookingExtended
    if (shouldReturnExtended) {
      return {
        ...data,
        items: (data.items as BookingExtended[]).map(transformBookingExtended),
      };
    }

    return data;
  },

  /**
   * Get booking by ID
   * GET /bookings/{id}
   */
  async getBookingById(id: string): Promise<Booking> {
    const response = await apiClient.get(`/bookings/${encodeURIComponent(id)}`);
    return validateResponse(response.data, BookingSchema);
  },

  /**
   * Update booking (ADMIN only)
   * PATCH /bookings/{id}
   */
  async updateBooking(id: string, data: {
    quantity?: number;
    guestContact?: BookingCreateDto['guestContact'];
    notes?: string;
  }): Promise<BookingExtended> {
    const response = await apiClient.patch(`/bookings/${encodeURIComponent(id)}`, data);
    const booking = validateResponse(response.data, BookingExtendedSchema);

    // Transform URLs
    return transformBookingExtended(booking);
  },

  /**
   * Cancel booking (self for HOLD/CONFIRMED within policy, or ADMIN)
   * POST /bookings/{id}/cancel
   */
  async cancelBooking(id: string): Promise<Booking> {
    const response = await apiClient.post(`/bookings/${encodeURIComponent(id)}/cancel`);
    return validateResponse(response.data, BookingSchema);
  },

  /**
   * Confirm booking (offline payment, ADMIN only)
   * POST /bookings/{id}/confirm
   */
  async confirmBooking(id: string): Promise<Booking> {
    const response = await apiClient.post(`/bookings/${encodeURIComponent(id)}/confirm`);
    return validateResponse(response.data, BookingSchema);
  },
};