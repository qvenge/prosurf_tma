import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { certificatesClient } from '../clients/certificates';
import type { Certificate, CertificateCreateDto, CertificateFilters, PaginatedResponse } from '../types';

export const certificatesKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificatesKeys.all, 'list'] as const,
  list: (filters?: CertificateFilters) => [...certificatesKeys.lists(), filters] as const,
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

export const useCreateCertificate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CertificateCreateDto) => certificatesClient.createCertificate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificatesKeys.lists() });
    },
  });
};

export const useCurrentUserCertificates = () => {
  const queryClient = useQueryClient();
  const getCurrentUserId = (): string | null => {
    const authData = queryClient.getQueryData(['auth', 'user', 'profile']) as { id?: string } | undefined;
    return authData?.id || null;
  };

  const userId = getCurrentUserId();
  return useQuery({
    queryKey: certificatesKeys.list({ userId: userId! }),
    queryFn: () => certificatesClient.getCertificates({ userId: userId! }),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
};