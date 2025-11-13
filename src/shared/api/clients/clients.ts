import { apiClient, validateResponse, joinApiUrl } from '../config';
import {
  UserSchema,
  UserUpdateDtoSchema,
  CashbackWalletSchema
} from '../schemas';
import type {
  User,
  UserUpdateDto,
  CashbackWallet
} from '../types';

/**
 * Transform client photoUrl to full URL
 */
const transformClientPhotoUrl = (client: User): User => ({
  ...client,
  photoUrl: joinApiUrl(client.photoUrl),
});

/**
 * Clients API client
 *
 * Provides methods for managing the current client profile in Telegram Mini App.
 * All endpoints are self-only (no admin operations).
 */
export const clientsClient = {
  /**
   * Get current client profile
   * GET /clients/me
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get('/clients/me');
    const client = validateResponse(response.data, UserSchema);

    // Transform client photo URL
    return transformClientPhotoUrl(client);
  },

  /**
   * Update current client profile
   * PATCH /clients/me
   *
   * Always uses multipart/form-data to support photo uploads.
   * Only sends fields with non-empty values (except firstName/lastName which can be empty).
   * To delete photo, set deletePhoto to true.
   *
   * @param data - Client update data (only non-empty values will be sent)
   * @param photo - Optional photo file (max 10MB, formats: JPEG, PNG, GIF, WebP)
   * @param deletePhoto - Set to true to delete existing photo
   */
  async updateMe(data: UserUpdateDto, photo?: File, deletePhoto?: boolean): Promise<User> {
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
      '/clients/me',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const client = validateResponse(response.data, UserSchema);

    // Transform client photo URL
    return transformClientPhotoUrl(client);
  },

  /**
   * Get current client cashback wallet
   * GET /clients/me/cashback
   */
  async getMyCashback(): Promise<CashbackWallet> {
    const response = await apiClient.get('/clients/me/cashback');
    return validateResponse(response.data, CashbackWalletSchema);
  },
};
