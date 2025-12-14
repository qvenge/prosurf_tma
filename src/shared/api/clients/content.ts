import { z } from 'zod';
import { apiClient, validateResponse, createQueryString } from '../config';
import {
  ContentSchema,
  ContentFiltersSchema,
  PaginatedResponseSchema,
} from '../schemas';
import type {
  Content,
  ContentFilters,
  PaginatedResponse,
} from '../types';

/**
 * Content API client
 */
export const contentClient = {
  /**
   * Get all content with filtering and pagination
   * GET /content
   */
  async getContents(filters?: ContentFilters): Promise<PaginatedResponse<Content>> {
    const validatedFilters = ContentFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/content${queryString}`);
    return validateResponse(response.data, PaginatedResponseSchema(ContentSchema));
  },

  /**
   * Get content by unique key
   * GET /content/key/:key
   */
  async getContentByKey(key: string): Promise<Content> {
    const response = await apiClient.get(`/content/key/${encodeURIComponent(key)}`);
    return validateResponse(response.data, ContentSchema);
  },

  /**
   * Get multiple contents by keys (batch)
   * GET /content/keys?keys[]=...
   */
  async getContentsByKeys(keys: string[]): Promise<Content[]> {
    const params = new URLSearchParams();
    keys.forEach(key => params.append('keys', key));

    const response = await apiClient.get(`/content/keys?${params.toString()}`);
    return validateResponse(response.data, z.array(ContentSchema));
  },
};
