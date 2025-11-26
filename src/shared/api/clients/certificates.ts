import { apiClient, validateResponse, createQueryString } from '../config';
import {
  CertificateDtoSchema,
  CertificateProductsResponseSchema,
  PurchaseCertificateDtoSchema,
  PurchaseCertificateResponseSchema,
  CertificateActivationResponseSchema,
  CheckCertificateResponseSchema,
  PurchasedCertificateFiltersSchema,
  ActivatedCertificateFiltersSchema,
  ListCertificatesResponseSchema,
} from '../schemas';
import type {
  CertificateDto,
  CertificateProductsResponse,
  PurchaseCertificateDto,
  PurchaseCertificateResponse,
  CertificateActivationResponse,
  CheckCertificateResponse,
  PurchasedCertificateFilters,
  ActivatedCertificateFilters,
  ListCertificatesResponse,
} from '../types';

/**
 * Certificates API client
 */
export const certificatesClient = {
  /**
   * Get certificate by ID
   * GET /certificates/{id}
   */
  async getCertificateById(id: string): Promise<CertificateDto> {
    const response = await apiClient.get(`/certificates/${encodeURIComponent(id)}`);
    return validateResponse(response.data, CertificateDtoSchema);
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

  /**
   * Activate a certificate by code
   * POST /certificates/activate
   */
  async activateCertificate(code: string): Promise<CertificateActivationResponse> {
    const response = await apiClient.post('/certificates/activate', { code });
    return validateResponse(response.data, CertificateActivationResponseSchema);
  },

  /**
   * Get certificates purchased by current user
   * GET /certificates/purchased
   */
  async getPurchasedCertificates(
    filters?: PurchasedCertificateFilters
  ): Promise<ListCertificatesResponse> {
    const validatedFilters = PurchasedCertificateFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/certificates/purchased${queryString}`);
    return validateResponse(response.data, ListCertificatesResponseSchema);
  },

  /**
   * Get certificates activated by current user
   * GET /certificates/activated
   */
  async getActivatedCertificates(
    filters?: ActivatedCertificateFilters
  ): Promise<ListCertificatesResponse> {
    const validatedFilters = ActivatedCertificateFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/certificates/activated${queryString}`);
    return validateResponse(response.data, ListCertificatesResponseSchema);
  },

  /**
   * Check certificate by code before activation
   * GET /certificates/by-code/{code}
   */
  async checkCertificateByCode(code: string): Promise<CheckCertificateResponse> {
    const response = await apiClient.get(`/certificates/by-code/${encodeURIComponent(code)}`);
    return validateResponse(response.data, CheckCertificateResponseSchema);
  },
};