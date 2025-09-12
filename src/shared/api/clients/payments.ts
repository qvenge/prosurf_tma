import { apiClient, validateResponse, withIdempotency } from '../config';
import { 
  PaymentSchema, 
  PaymentRequestSchema,
  RefundSchema,
  RefundRequestSchema
} from '../schemas';
import type { 
  Payment, 
  PaymentRequest,
  Refund,
  RefundRequest,
  IdempotencyKey
} from '../types';

/**
 * Payments API client
 * 
 * Handles payment creation, retrieval, and refund operations.
 * Supports single payment methods (card, certificate, pass, cashback) and composite payments.
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
   *       { method: 'cashback', amount: { currency: 'KZT', amountMinor: 1500 } },
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
      validatedData,
      config
    );
    return validateResponse(response.data, PaymentSchema);
  },

  /**
   * Get payment by ID
   * GET /payments/{id}
   */
  async getPaymentById(id: string): Promise<Payment> {
    const response = await apiClient.get(`/payments/${encodeURIComponent(id)}`);
    return validateResponse(response.data, PaymentSchema);
  },

  /**
   * Create refund for payment
   * POST /payments/{id}/refunds
   */
  async createRefund(
    paymentId: string, 
    idempotencyKey: IdempotencyKey,
    data?: RefundRequest
  ): Promise<Refund> {
    const validatedData = data ? RefundRequestSchema.parse(data) : {};
    
    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/payments/${encodeURIComponent(paymentId)}/refunds`, 
      validatedData,
      config
    );
    return validateResponse(response.data, RefundSchema);
  },
};