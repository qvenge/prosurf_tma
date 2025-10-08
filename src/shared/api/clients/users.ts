import { apiClient, validateResponse, createQueryString, joinApiUrl } from '../config';
import {
  UserSchema,
  UserUpdateDtoSchema,
  PaginatedResponseSchema,
  UserFiltersSchema,
  CashbackWalletSchema
} from '../schemas';
import type {
  User,
  UserUpdateDto,
  PaginatedResponse,
  UserFilters,
  CashbackWallet
} from '../types';

/**
 * Transform user photoUrl to full URL
 */
const transformUserPhotoUrl = (user: User): User => ({
  ...user,
  photoUrl: joinApiUrl(user.photoUrl),
});

/**
 * Users API client
 */
export const usersClient = {
  /**
   * Get list of users (ADMIN only)
   * GET /users
   */
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const validatedFilters = UserFiltersSchema.parse(filters || {});
    const queryString = createQueryString(validatedFilters);

    const response = await apiClient.get(`/users${queryString}`);
    const data = validateResponse(response.data, PaginatedResponseSchema(UserSchema));

    // Transform user photo URLs
    return {
      ...data,
      items: data.items.map(transformUserPhotoUrl),
    };
  },

  /**
   * Get user by ID (self or ADMIN)
   * GET /users/{id}
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${encodeURIComponent(id)}`);
    const user = validateResponse(response.data, UserSchema);

    // Transform user photo URL
    return transformUserPhotoUrl(user);
  },

  /**
   * Update user profile (self only)
   * PATCH /users/{id}
   *
   * Always uses multipart/form-data to support photo uploads.
   * Only sends fields with non-empty values (except firstName/lastName which can be empty).
   * To delete photo, set deletePhoto to true.
   *
   * @param id - User ID
   * @param data - User update data (only non-empty values will be sent)
   * @param photo - Optional photo file (max 10MB, formats: JPEG, PNG, GIF, WebP)
   * @param deletePhoto - Set to true to delete existing photo
   */
  async updateUser(id: string, data: UserUpdateDto, photo?: File, deletePhoto?: boolean): Promise<User> {
    const validatedData = UserUpdateDtoSchema.parse(data);

    // Always use multipart/form-data
    const formData = new FormData();

    // Append text fields
    // Empty string "" means field should be cleared (set to null)
    // undefined means field should not be changed
    if (validatedData.phone !== undefined) {
      formData.append('phone', validatedData.phone ?? '');
    }
    if (validatedData.firstName !== undefined) {
      formData.append('firstName', validatedData.firstName ?? '');
    }
    if (validatedData.lastName !== undefined) {
      formData.append('lastName', validatedData.lastName ?? '');
    }
    if (validatedData.email !== undefined) {
      formData.append('email', validatedData.email ?? '');
    }
    if (validatedData.dateOfBirth !== undefined) {
      formData.append('dateOfBirth', validatedData.dateOfBirth ?? '');
    }

    // Handle photo upload
    if (photo) {
      formData.append('photo', photo);
    }

    // Handle photo deletion as a boolean form field
    if (deletePhoto) {
      formData.append('deletePhoto', 'true');
    }

    const response = await apiClient.patch(
      `/users/${encodeURIComponent(id)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const user = validateResponse(response.data, UserSchema);

    // Transform user photo URL
    return transformUserPhotoUrl(user);
  },

  /**
   * Get user cashback wallet (self or ADMIN)
   * GET /users/{id}/cashback
   */
  async getUserCashback(id: string): Promise<CashbackWallet> {
    const response = await apiClient.get(`/users/${encodeURIComponent(id)}/cashback`);
    return validateResponse(response.data, CashbackWalletSchema);
  },
};