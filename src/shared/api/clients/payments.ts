import { apiClient, validateResponse, withIdempotency, createQueryString } from '../config';
import {
  PaymentSchema,
  PaymentRequestSchema,
  PaymentListItemSchema,
  PaymentFiltersSchema,
  PaginatedResponseSchema
} from '../schemas';
import type {
  Payment,
  PaymentRequest,
  IdempotencyKey,
  PaymentListItem,
  PaymentFilters,
  PaginatedResponse
} from '../types';

/**
 * Payments API client
 * 
 * Handles payment creation, retrieval, and refund operations.
 * Supports single payment methods (card, certificate, pass, bonus) and composite payments.
 */
export const paymentsClient = {
  /**
   * Create payment for booking (single or composite payment method)
   * POST /bookings/{id}/payment
   * 
   * Creates or continues a payment for the specified booking (booking must be in HOLD state).
   * 
   * @param bookingId - The ID of the booking to pay for
   * @param data - Payment method (single or composite with multiple methods)
   * @param idempotencyKey - Unique key for request idempotency (8-128 chars)
   * @returns Promise resolving to payment with status and next action
   * 
   * @example
   * ```ts
   * // Single payment method
   * const payment = await paymentsClient.createPayment(
   *   'booking-123',
   *   { method: 'card', provider: 'telegram' },
   *   'idempotency-key-123'
   * );
   * 
   * // Composite payment
   * const compositePayment = await paymentsClient.createPayment(
   *   'booking-123',
   *   {
   *     methods: [
   *       { method: 'certificate', certificateId: 'cert-123' },
   *       { method: 'bonus', amount: 1500 },
   *       { method: 'card', provider: 'telegram' }
   *     ]
   *   },
   *   'idempotency-key-456'
   * );
   * ```
   */
  async createPayment(
    bookingId: string, 
    data: PaymentRequest, 
    idempotencyKey: IdempotencyKey
  ): Promise<Payment> {
    const validatedData = PaymentRequestSchema.parse(data);
    
    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/bookings/${encodeURIComponent(bookingId)}/payment`,
      { paymentMethods: validatedData },
      config
    );
    return validateResponse(response.data, PaymentSchema);
  },

  /**
   * Get list of current user payments
   * GET /payments
   *
   * @param filters - Optional filters (status, category, dates, labels, attributes, sorting)
   * @returns Promise resolving to paginated list of payment items
   *
   * @example
   * ```ts
   * // Get all payments
   * const payments = await paymentsClient.getPayments();
   *
   * // Get succeeded and failed payments for sessions
   * const sessionPayments = await paymentsClient.getPayments({
   *   status: ['SUCCEEDED', 'FAILED'],
   *   category: 'session',
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc',
   * });
   *
   * // Get payments with pagination
   * const page1 = await paymentsClient.getPayments({ limit: 10 });
   * const page2 = await paymentsClient.getPayments({ cursor: page1.next, limit: 10 });
   * ```
   */
  async getPayments(filters?: PaymentFilters): Promise<PaginatedResponse<PaymentListItem>> {
    const validatedFilters = PaymentFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/payments${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(PaymentListItemSchema));
  },

  /**
   * Get payment by ID
   * GET /payments/{id}
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get(`/payments/${encodeURIComponent(id)}`);
    return validateResponse(response.data, PaymentSchema);
  },
};