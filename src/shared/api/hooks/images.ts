import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { imagesClient } from '../clients/images';
import type { Image, ImageFilters, PaginatedResponse } from '../types';

// Query key factory for images
export const imagesKeys = {
  all: ['images'] as const,
  lists: () => [...imagesKeys.all, 'list'] as const,
  list: (filters?: ImageFilters) => [...imagesKeys.lists(), filters] as const,
} as const;

/**
 * Images hooks
 */

// Get images with filtering
export const useImages = (filters?: ImageFilters) => {
  return useQuery({
    queryKey: imagesKeys.list(filters),
    queryFn: () => imagesClient.getImages(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Infinite query for images
export const useImagesInfinite = (filters?: Omit<ImageFilters, 'cursor'>) => {
  return useInfiniteQuery({
    queryKey: imagesKeys.list(filters),
    queryFn: ({ pageParam }) => imagesClient.getImages({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PaginatedResponse<Image>) => lastPage.next,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for searching images
export const useImageSearch = (searchQuery: string, additionalFilters?: Omit<ImageFilters, 'q'>) => {
  const filters: ImageFilters = {
    q: searchQuery,
    ...additionalFilters,
  };

  return useQuery({
    queryKey: imagesKeys.list(filters),
    queryFn: () => imagesClient.getImages(filters),
    enabled: searchQuery.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};
