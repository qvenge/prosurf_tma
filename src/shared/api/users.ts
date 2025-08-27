import { apiClient } from './config';
import { handleApiError } from './error-handler';
import { UserSchema, type User } from './schemas';

export const usersApi = {
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/users/profile');
      return UserSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};