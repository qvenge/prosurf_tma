import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { adminClient } from '../clients/admin';
import type { AuditLog, AuditLogFilters, PaginatedResponse } from '../types';

export const adminKeys = {
  all: ['admin'] as const,
  auditLogs: (filters?: AuditLogFilters) => [...adminKeys.all, 'audit-logs', filters] as const,
  jobs: () => [...adminKeys.all, 'jobs'] as const,
} as const;

export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: () => adminClient.getAuditLogs(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAuditLogsInfinite = (filters?: Omit<AuditLogFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: ({ pageParam }) => adminClient.getAuditLogs({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<AuditLog>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRunBookingExpiryJob = () => {
  return useMutation({
    mutationFn: () => adminClient.runBookingExpiryJob(),
  });
};

export const useRunCertificateExpiryJob = () => {
  return useMutation({
    mutationFn: () => adminClient.runCertificateExpiryJob(),
  });
};

export const useRunSeasonTicketExpiryJob = () => {
  return useMutation({
    mutationFn: () => adminClient.runSeasonTicketExpiryJob(),
  });
};