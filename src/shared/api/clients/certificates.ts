import { apiClient, validateResponse, createQueryString } from '../config';
import {
  CertificateSchema,
  PaginatedResponseSchema,
  CertificateFiltersSchema
} from '../schemas';
import type {
  Certificate,
  PaginatedResponse,
  CertificateFilters
} from '../types';

/**
 * Certificates API client
 */
export const certificatesClient = {
  /**
   * Get certificates (user's own certificates)
   * GET /certificates
   */
  async getCertificates(filters?: CertificateFilters): Promise<PaginatedResponse<Certificate>> {
    const validatedFilters = CertificateFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/certificates${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(CertificateSchema));
  },

  /**
   * Get certificate by ID
   * GET /certificates/{id}
   */
  async getCertificateById(id: string): Promise<Certificate> {
    const response = await apiClient.get(`/certificates/${encodeURIComponent(id)}`);
    return validateResponse(response.data, CertificateSchema);
  },
};