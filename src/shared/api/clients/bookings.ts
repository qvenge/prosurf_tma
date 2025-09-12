import { apiClient, validateResponse, createQueryString, withIdempotency } from '../config';
import { 
  BookingSchema, 
  BookRequestSchema,
  PaginatedResponseSchema,
  BookingFiltersSchema
} from '../schemas';
import type { 
  Booking, 
  BookRequest,
  BookingWithHoldTTL,
  PaginatedResponse,
  BookingFilters,
  IdempotencyKey
} from '../types';

/**
 * Bookings API client
 * 
 * Manages session bookings including creation, retrieval, cancellation, and confirmation.
 * Bookings start in HOLD status and must be paid within the hold TTL period.
 */
export const bookingsClient = {
  /**
   * Book seats in a session (create HOLD)
   * POST /sessions/{id}/book
   * 
   * Creates a booking in HOLD status for the specified session.
   * The booking must be paid within the hold TTL period or it will expire.
   * 
   * @param sessionId - The ID of the session to book
   * @param data - Booking request with quantity of seats
   * @param idempotencyKey - Unique key for request idempotency (8-128 chars)
   * @returns Promise resolving to booking data with hold TTL information
   * 
   * @example
   * ```ts
   * const result = await bookingsClient.bookSession(
   *   'session-123',
   *   { quantity: 2 },
   *   'booking-idempotency-key'
   * );
   * console.log(`Hold expires in ${result.holdTtlSeconds} seconds`);
   * ```
   */
  async bookSession(
    sessionId: string, 
    data: BookRequest, 
    idempotencyKey: IdempotencyKey
  ): Promise<BookingWithHoldTTL> {
    const validatedData = BookRequestSchema.parse(data);
    
    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/sessions/${encodeURIComponent(sessionId)}/book`, 
      validatedData,
      config
    );
    
    const booking = validateResponse(response.data, BookingSchema);
    const holdTtlSeconds = response.headers['x-hold-ttl'] 
      ? parseInt(response.headers['x-hold-ttl'] as string, 10) 
      : null;
    
    return {
      booking,
      holdTtlSeconds,
    };
  },

  /**
   * Get list of bookings (self or ADMIN)
   * GET /bookings
   */
  async getBookings(filters?: BookingFilters): Promise<PaginatedResponse<Booking>> {
    const validatedFilters = BookingFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);
    
    const response = await apiClient.get(`/bookings${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(BookingSchema));
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