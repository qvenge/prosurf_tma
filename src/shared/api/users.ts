import { apiClient } from './config';
import { handleApiError } from './error-handler';
import {
  UserSchema,
  BookingWithSessionResponseSchema,
  SubscriptionResponseSchema,
  PaymentResponseSchema,
  GetUserBookingsQuerySchema,
  type User,
  type BookingWithSessionResponse,
  type SubscriptionResponse,
  type PaymentResponse,
  type GetUserBookingsQuery,
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

  getUserBookings: async (
    userId: string, 
    query: GetUserBookingsQuery = {}
  ): Promise<BookingWithSessionResponse[]> => {
    try {
      const validatedQuery = GetUserBookingsQuerySchema.parse(query);
      const params = new URLSearchParams();

      if (validatedQuery.status?.length) {
        validatedQuery.status.forEach(status => params.append('status', status));
      }

      if (validatedQuery.sessionType?.length) {
        validatedQuery.sessionType.forEach(type => params.append('sessionType', type));
      }

      if (validatedQuery.sessionStartFrom) {
        params.append('sessionStartFrom', validatedQuery.sessionStartFrom);
      }

      if (validatedQuery.sessionStartTo) {
        params.append('sessionStartTo', validatedQuery.sessionStartTo);
      }

      if (validatedQuery.sortBy) {
        params.append('sortBy', validatedQuery.sortBy);
      }

      if (validatedQuery.sortOrder) {
        params.append('sortOrder', validatedQuery.sortOrder);
      }

      if (validatedQuery.offset !== undefined) {
        params.append('offset', validatedQuery.offset.toString());
      }

      if (validatedQuery.limit !== undefined) {
        params.append('limit', validatedQuery.limit.toString());
      }

      const queryString = params.toString();
      const url = queryString 
        ? `/users/${encodeURIComponent(userId)}/bookings?${queryString}`
        : `/users/${encodeURIComponent(userId)}/bookings`;

      const response = await apiClient.get(url);
      return z.array(BookingWithSessionResponseSchema).parse(response.data);
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