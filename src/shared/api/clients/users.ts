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
   */
  async updateUser(id: string, data: UserUpdateDto): Promise<User> {
    const validatedData = UserUpdateDtoSchema.parse(data);
    
    const response = await apiClient.patch(
      `/users/${encodeURIComponent(id)}`, 
      validatedData
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