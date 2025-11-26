import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificatesClient } from '../clients/certificates';
import type {
  PurchaseCertificateDto,
  PurchasedCertificateFilters,
  ActivatedCertificateFilters,
  ListCertificatesResponse,
} from '../types';

export const certificatesKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificatesKeys.all, 'list'] as const,
  products: () => [...certificatesKeys.all, 'products'] as const,
  purchased: (filters?: PurchasedCertificateFilters) =>
    [...certificatesKeys.all, 'purchased', filters] as const,
  activated: (filters?: ActivatedCertificateFilters) =>
    [...certificatesKeys.all, 'activated', filters] as const,
  check: (code: string) => [...certificatesKeys.all, 'check', code] as const,
  detail: (id: string) => [...certificatesKeys.all, id] as const,
} as const;

/**
 * Get certificate by ID
 */
export const useCertificateById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: certificatesKeys.detail(id),
    queryFn: () => certificatesClient.getCertificateById(id),
    enabled: enabled && id.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get available certificate products for purchase
 */
export const useCertificateProducts = () => {
  return useQuery({
    queryKey: certificatesKeys.products(),
    queryFn: () => certificatesClient.getCertificateProducts(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Purchase a certificate
 */
export const usePurchaseCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, idempotencyKey }: { data: PurchaseCertificateDto; idempotencyKey: string }) =>
      certificatesClient.purchaseCertificate(data, idempotencyKey),
    onSuccess: () => {
      // Invalidate certificates lists to refetch with new certificate
      queryClient.invalidateQueries({ queryKey: certificatesKeys.lists() });
    },
  });
};

/**
 * Activate a certificate by code
 */
export const useActivateCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => certificatesClient.activateCertificate(code),
    onSuccess: (data) => {
      // Invalidate certificates lists (new activated certificate)
      queryClient.invalidateQueries({ queryKey: certificatesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: certificatesKeys.purchased() });
      queryClient.invalidateQueries({ queryKey: certificatesKeys.activated() });

      // Invalidate season tickets if season_ticket was created
      if (data.result.type === 'season_ticket') {
        queryClient.invalidateQueries({ queryKey: ['season-tickets'] });
      }

      // Invalidate cashback if cashback was added
      if (data.result.type === 'cashback') {
        queryClient.invalidateQueries({ queryKey: ['cashback'] });
      }
    },
  });
};

/**
 * Get certificates purchased by current user
 */
export const usePurchasedCertificates = (filters?: PurchasedCertificateFilters) => {
  return useQuery({
    queryKey: certificatesKeys.purchased(filters),
    queryFn: () => certificatesClient.getPurchasedCertificates(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get certificates purchased by current user (infinite scroll)
 */
export const usePurchasedCertificatesInfinite = (
  filters?: Omit<PurchasedCertificateFilters, 'cursor'>
) => {
  return useInfiniteQuery({
    queryKey: certificatesKeys.purchased(filters),
    queryFn: ({ pageParam }) =>
      certificatesClient.getPurchasedCertificates({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ListCertificatesResponse) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get certificates activated by current user
 */
export const useActivatedCertificates = (filters?: ActivatedCertificateFilters) => {
  return useQuery({
    queryKey: certificatesKeys.activated(filters),
    queryFn: () => certificatesClient.getActivatedCertificates(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get certificates activated by current user (infinite scroll)
 */
export const useActivatedCertificatesInfinite = (
  filters?: Omit<ActivatedCertificateFilters, 'cursor'>
) => {
  return useInfiniteQuery({
    queryKey: certificatesKeys.activated(filters),
    queryFn: ({ pageParam }) =>
      certificatesClient.getActivatedCertificates({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: ListCertificatesResponse) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Check certificate by code before activation
 */
export const useCheckCertificateByCode = (code: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: certificatesKeys.check(code),
    queryFn: () => certificatesClient.checkCertificateByCode(code),
    enabled: enabled && code.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: false, // Don't retry on 404
  });
};