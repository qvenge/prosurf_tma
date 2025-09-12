import { apiClient, validateResponse, createQueryString } from '../config';
import { 
  CertificateSchema, 
  CertificateCreateDtoSchema,
  PaginatedResponseSchema,
  CertificateFiltersSchema
} from '../schemas';
import type { 
  Certificate, 
  CertificateCreateDto,
  PaginatedResponse,
  CertificateFilters
} from '../types';

/**
 * Certificates API client
 */
export const certificatesClient = {
  /**
   * Issue/create certificate (ADMIN only)
   * POST /certificates
   */
  async createCertificate(data: CertificateCreateDto): Promise<Certificate> {
    const validatedData = CertificateCreateDtoSchema.parse(data);
    
    const response = await apiClient.post('/certificates', validatedData);
    return validateResponse(response.data, CertificateSchema);
  },

  /**
   * Get certificates (user's own or all for ADMIN)
   * GET /certificates
   */
  async getCertificates(filters?: CertificateFilters): Promise<PaginatedResponse<Certificate>> {
    const validatedFilters = CertificateFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);
    
    const response = await apiClient.get(`/certificates${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(CertificateSchema));
  },
};