import { apiClient, validateResponse, createQueryString } from '../config';
import {
  CertificateSchema,
  PaginatedResponseSchema,
  CertificateFiltersSchema,
  CertificateProductsResponseSchema,
  PurchaseCertificateDtoSchema,
  PurchaseCertificateResponseSchema,
} from '../schemas';
import type {
  Certificate,
  PaginatedResponse,
  CertificateFilters,
  CertificateProductsResponse,
  PurchaseCertificateDto,
  PurchaseCertificateResponse,
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

  /**
   * Get available certificate products for purchase
   * GET /certificates/products
   */
  async getCertificateProducts(): Promise<CertificateProductsResponse> {
    const response = await apiClient.get('/certificates/products');
    return validateResponse(response.data, CertificateProductsResponseSchema);
  },

  /**
   * Purchase a certificate
   * POST /certificates/purchase
   */
  async purchaseCertificate(
    data: PurchaseCertificateDto,
    idempotencyKey: string
  ): Promise<PurchaseCertificateResponse> {
    const validatedData = PurchaseCertificateDtoSchema.parse(data);
    const response = await apiClient.post('/certificates/purchase', validatedData, {
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    });
    return validateResponse(response.data, PurchaseCertificateResponseSchema);
  },
};