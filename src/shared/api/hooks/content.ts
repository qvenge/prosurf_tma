import { useQuery } from '@tanstack/react-query';
import { contentClient } from '../clients/content';
import type { ContentFilters } from '../types';

// Query key factory for content
export const contentKeys = {
  all: ['content'] as const,
  lists: () => [...contentKeys.all, 'list'] as const,
  list: (filters?: ContentFilters) => [...contentKeys.lists(), filters] as const,
  byKey: (key: string) => [...contentKeys.all, 'key', key] as const,
  byKeys: (keys: string[]) => [...contentKeys.all, 'keys', keys] as const,
} as const;

/**
 * Content hooks
 */

// Get all content with filtering and pagination
export const useContents = (filters?: ContentFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: contentKeys.list(filters),
    queryFn: () => contentClient.getContents(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled ?? true,
  });
};

// Get content by unique key
export const useContentByKey = (key: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: contentKeys.byKey(key),
    queryFn: () => contentClient.getContentByKey(key),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && !!key,
  });
};

// Get multiple contents by keys (batch)
export const useContentsByKeys = (keys: string[], options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: contentKeys.byKeys(keys),
    queryFn: () => contentClient.getContentsByKeys(keys),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: (options?.enabled ?? true) && keys.length > 0,
  });
};
