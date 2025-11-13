import { apiClient, validateResponse, createQueryString, withIdempotency } from '../config';
import {
  SeasonTicketPlanSchema,
  SeasonTicketSchema,
  PaymentSchema,
  PaymentRequestSchema,
  PaginatedResponseSchema,
  SeasonTicketPlanFiltersSchema,
  SeasonTicketFiltersSchema,
  EventSchema
} from '../schemas';
import type {
  SeasonTicketPlan,
  SeasonTicket,
  Payment,
  PaymentRequest,
  PaginatedResponse,
  SeasonTicketPlanFilters,
  SeasonTicketFilters,
  IdempotencyKey,
  Event,
  CursorParam,
  LimitParam
} from '../types';

/**
 * Season Tickets API client
 */
export const seasonTicketsClient = {
  /**
   * Get season ticket plans catalog
   * GET /season-ticket-plans
   */
  async getSeasonTicketPlans(filters?: SeasonTicketPlanFilters): Promise<PaginatedResponse<SeasonTicketPlan>> {
    const validatedFilters = SeasonTicketPlanFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/season-ticket-plans${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SeasonTicketPlanSchema));
  },

  /**
   * Get single season ticket plan
   * GET /season-ticket-plans/{id}
   */
  async getSeasonTicketPlan(id: string): Promise<SeasonTicketPlan> {
    const response = await apiClient.get(`/season-ticket-plans/${encodeURIComponent(id)}`);
    return validateResponse(response.data, SeasonTicketPlanSchema);
  },

  /**
   * Get events applicable to a season ticket plan
   * GET /season-ticket-plans/{id}/applicable-events
   */
  async getApplicableEvents(
    planId: string,
    filters?: { cursor?: CursorParam; limit?: LimitParam }
  ): Promise<PaginatedResponse<Event>> {
    const queryString = createQueryString(filters || {});
    const response = await apiClient.get(
      `/season-ticket-plans/${encodeURIComponent(planId)}/applicable-events${queryString}`
    );
    return validateResponse(response.data, PaginatedResponseSchema(EventSchema));
  },

  /**
   * Purchase season ticket (userId from token)
   * POST /season-ticket-plans/{id}/purchase
   * Supports both single and composite payment methods
   */
  async purchaseSeasonTicket(
    planId: string,
    paymentMethod: PaymentRequest,
    idempotencyKey: IdempotencyKey
  ): Promise<Payment> {
    const validatedPaymentMethod = PaymentRequestSchema.parse(paymentMethod);

    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/season-ticket-plans/${encodeURIComponent(planId)}/purchase`,
      validatedPaymentMethod,
      config
    );
    return validateResponse(response.data, PaymentSchema);
  },

  /**
   * Get season tickets (user's own or filtered by userId for ADMIN)
   * GET /season-tickets
   */
  async getSeasonTickets(filters?: SeasonTicketFilters): Promise<PaginatedResponse<SeasonTicket>> {
    const validatedFilters = SeasonTicketFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/season-tickets${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(SeasonTicketSchema));
  },

  /**
   * Get single season ticket by ID
   * GET /season-tickets/{id}
   */
  async getSeasonTicketById(id: string): Promise<SeasonTicket> {
    const response = await apiClient.get(`/season-tickets/${encodeURIComponent(id)}`);
    return validateResponse(response.data, SeasonTicketSchema);
  },

  /**
   * Cancel season ticket (proportional refund)
   * POST /season-tickets/{id}/cancel
   */
  async cancelSeasonTicket(id: string): Promise<void> {
    await apiClient.post(`/season-tickets/${encodeURIComponent(id)}/cancel`);
  },

  /**
   * Get season tickets for a specific client
   * GET /clients/{id}/season-tickets
   */
  async getClientSeasonTickets(
    clientId: string,
    filters?: { cursor?: CursorParam; limit?: LimitParam }
  ): Promise<PaginatedResponse<SeasonTicket>> {
    const queryString = createQueryString(filters || {});
    const response = await apiClient.get(
      `/clients/${encodeURIComponent(clientId)}/season-tickets${queryString}`
    );
    return validateResponse(response.data, PaginatedResponseSchema(SeasonTicketSchema));
  },
};