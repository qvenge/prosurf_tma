import { apiClient } from './config';
import { handleApiError } from './error-handler';
import {
  UserSchema,
  BookingResponseSchema,
  SubscriptionResponseSchema,
  PaymentResponseSchema,
  type User,
  type BookingResponse,
  type SubscriptionResponse,
  type PaymentResponse,
} from './schemas';
import { z } from 'zod';

export const usersApi = {
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/users/profile');
      return UserSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserBookings: async (userId: string): Promise<BookingResponse[]> => {
    try {
      const response = await apiClient.get(`/users/${encodeURIComponent(userId)}/bookings`);
      return z.array(BookingResponseSchema).parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserSubscriptions: async (userId: string): Promise<SubscriptionResponse[]> => {
    try {
      const response = await apiClient.get(`/users/${encodeURIComponent(userId)}/subscriptions`);
      return z.array(SubscriptionResponseSchema).parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getUserPayments: async (userId: string): Promise<PaymentResponse[]> => {
    try {
      const response = await apiClient.get(`/users/${encodeURIComponent(userId)}/payments`);
      return z.array(PaymentResponseSchema).parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};