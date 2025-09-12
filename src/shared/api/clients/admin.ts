import { apiClient, validateResponse, createQueryString } from '../config';
import { 
  AuditLogSchema,
  JobExecutionResultSchema,
  PaginatedResponseSchema,
  AuditLogFiltersSchema
} from '../schemas';
import type { 
  AuditLog,
  JobExecutionResult,
  PaginatedResponse,
  AuditLogFilters
} from '../types';

/**
 * Admin API client
 */
export const adminClient = {
  /**
   * Get audit logs (ADMIN only)
   * GET /admin/audit-logs
   */
  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    const validatedFilters = AuditLogFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);
    
    const response = await apiClient.get(`/admin/audit-logs${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(AuditLogSchema));
  },

  /**
   * Run booking expiry job (ADMIN only)
   * POST /admin/jobs/run/booking-expiry
   */
  async runBookingExpiryJob(): Promise<JobExecutionResult> {
    const response = await apiClient.post('/admin/jobs/run/booking-expiry');
    return validateResponse(response.data, JobExecutionResultSchema);
  },

  /**
   * Run certificate expiry job (ADMIN only)
   * POST /admin/jobs/run/certificate-expiry
   */
  async runCertificateExpiryJob(): Promise<JobExecutionResult> {
    const response = await apiClient.post('/admin/jobs/run/certificate-expiry');
    return validateResponse(response.data, JobExecutionResultSchema);
  },

  /**
   * Run season ticket expiry job (ADMIN only)
   * POST /admin/jobs/run/season-ticket-expiry
   */
  async runSeasonTicketExpiryJob(): Promise<JobExecutionResult> {
    const response = await apiClient.post('/admin/jobs/run/season-ticket-expiry');
    return validateResponse(response.data, JobExecutionResultSchema);
  },
};