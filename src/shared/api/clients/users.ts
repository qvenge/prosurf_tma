import { apiClient, validateResponse, createQueryString } from '../config';
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
    return validateResponse(response.data, PaginatedResponseSchema(UserSchema));
  },

  /**
   * Get user by ID (self or ADMIN)
   * GET /users/{id}
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${encodeURIComponent(id)}`);
    return validateResponse(response.data, UserSchema);
  },

  /**
   * Update user profile (self only)
   * PATCH /users/{id}
   *
   * Always uses multipart/form-data to support photo uploads and field deletion.
   * To delete a field, pass empty string or null in data.
   * To delete photo, set deletePhoto to true.
   *
   * @param id - User ID
   * @param data - User update data (use empty string or null to delete fields)
   * @param photo - Optional photo file (max 10MB, formats: JPEG, PNG, GIF, WebP)
   * @param deletePhoto - Set to true to delete existing photo
   */
  async updateUser(id: string, data: UserUpdateDto, photo?: File, deletePhoto?: boolean): Promise<User> {
    const validatedData = UserUpdateDtoSchema.parse(data);

    // Always use multipart/form-data
    const formData = new FormData();

    // Append text fields (including empty strings for deletion)
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

    return validateResponse(response.data, UserSchema);
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