import { apiClient } from './config';
import { handleApiError } from './error-handler';
import {
  CreateBookingSchema,
  BookingResponseSchema,
  type CreateBooking,
  type BookingResponse,
} from './schemas';
import { z } from 'zod';

export const bookingsApi = {
  createBooking: async (data: CreateBooking): Promise<BookingResponse> => {
    try {
      const validatedData = CreateBookingSchema.parse(data);
      const response = await apiClient.post('/bookings', validatedData);
      return BookingResponseSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },


  getAllBookings: async (): Promise<BookingResponse[]> => {
    try {
      const response = await apiClient.get('/bookings');
      return z.array(BookingResponseSchema).parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getBookingById: async (id: string): Promise<BookingResponse> => {
    try {
      const response = await apiClient.get(`/bookings/${encodeURIComponent(id)}`);
      return BookingResponseSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  cancelBooking: async (id: string): Promise<BookingResponse> => {
    try {
      const response = await apiClient.delete(`/bookings/${encodeURIComponent(id)}`);
      return BookingResponseSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  redeemSubscription: async (id: string): Promise<BookingResponse> => {
    try {
      const response = await apiClient.post(`/bookings/${encodeURIComponent(id)}/redeem-subscription`);
      return BookingResponseSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};