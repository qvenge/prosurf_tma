import { apiClient, validateResponse, createQueryString, joinApiUrl } from '../config';
import {
  ImageSchema,
  ImageFiltersSchema,
  PaginatedResponseSchema,
} from '../schemas';
import type {
  Image,
  ImageFilters,
  PaginatedResponse,
} from '../types';

/**
 * Transform image URLs to full URLs
 */
const transformImageUrl = (image: Image): Image => ({
  ...image,
  url: joinApiUrl(image.url) || image.url,
});

/**
 * Images API client
 */
export const imagesClient = {
  /**
   * Get images with filtering and pagination
   * GET /images
   */
  async getImages(filters?: ImageFilters): Promise<PaginatedResponse<Image>> {
    const validatedFilters = ImageFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/images${queryString}`);
    const data = validateResponse(response.data, PaginatedResponseSchema(ImageSchema));

    // Transform image URLs
    return {
      ...data,
      items: data.items.map(transformImageUrl),
    };
  },
};
