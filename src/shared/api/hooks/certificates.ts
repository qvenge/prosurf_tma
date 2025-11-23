import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificatesClient } from '../clients/certificates';
import { useAuth } from '../auth';
import type {
  Certificate,
  CertificateFilters,
  PaginatedResponse,
  PurchaseCertificateDto,
} from '../types';

export const certificatesKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificatesKeys.all, 'list'] as const,
  list: (filters?: CertificateFilters) => [...certificatesKeys.lists(), filters] as const,
  products: () => [...certificatesKeys.all, 'products'] as const,
} as const;

export const useCertificates = (filters?: CertificateFilters) => {
  return useQuery({
    queryKey: certificatesKeys.list(filters),
    queryFn: () => certificatesClient.getCertificates(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCertificatesInfinite = (filters?: Omit<CertificateFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: certificatesKeys.list(filters),
    queryFn: ({ pageParam }) => certificatesClient.getCertificates({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Certificate>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCurrentUserCertificates = () => {
  const auth = useAuth();
  const userId = auth.user?.id;

  return useQuery({
    queryKey: certificatesKeys.list(),
    queryFn: () => certificatesClient.getCertificates(),
    enabled: Boolean(userId),
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
      // Invalidate certificates list to refetch with new certificate
      queryClient.invalidateQueries({ queryKey: certificatesKeys.lists() });
    },
  });
};