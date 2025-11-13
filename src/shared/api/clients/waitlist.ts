import { apiClient, validateResponse, createQueryString, withIdempotency } from '../config';
import { 
  WaitlistEntrySchema,
  PaginatedResponseSchema,
  WaitlistFiltersSchema
} from '../schemas';
import type { 
  WaitlistEntry,
  PaginatedResponse,
  WaitlistFilters,
  IdempotencyKey
} from '../types';

/**
 * Waitlist API client
 */
export const waitlistClient = {
  /**
   * Join session waitlist
   * POST /sessions/{id}/waitlist
   */
  async joinWaitlist(sessionId: string, idempotencyKey: IdempotencyKey): Promise<WaitlistEntry> {
    const config = withIdempotency({}, idempotencyKey);
    const response = await apiClient.post(
      `/sessions/${encodeURIComponent(sessionId)}/waitlist`,
      {},
      config
    );
    return validateResponse(response.data, WaitlistEntrySchema);
  },

  /**
   * Get client's waitlist entries
   * GET /clients/{id}/waitlist
   */
  async getClientWaitlist(clientId: string, filters?: WaitlistFilters): Promise<PaginatedResponse<WaitlistEntry>> {
    const validatedFilters = WaitlistFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/clients/${encodeURIComponent(clientId)}/waitlist${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(WaitlistEntrySchema));
  },

  /**
   * Leave session waitlist
   * DELETE /sessions/{id}/waitlist
   */
  async leaveWaitlist(sessionId: string): Promise<void> {
    await apiClient.delete(`/sessions/${encodeURIComponent(sessionId)}/waitlist`);
  },
};