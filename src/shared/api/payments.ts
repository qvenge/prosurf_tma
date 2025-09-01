import { apiClient } from './config';
import { handleApiError } from './error-handler';
import {
  CreatePaymentIntentSchema,
  PaymentResponseSchema,
  CreatePaymentIntentResponseSchema,
  type CreatePaymentIntent,
  type PaymentResponse,
  type CreatePaymentIntentResponse,
} from './schemas';
import { z } from 'zod';

export const paymentsApi = {
  createPaymentIntent: async (data: CreatePaymentIntent): Promise<CreatePaymentIntentResponse> => {
    try {
      const validatedData = CreatePaymentIntentSchema.parse(data);
      const response = await apiClient.post('/payments/intents', validatedData);
      return CreatePaymentIntentResponseSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAllPayments: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await apiClient.get('/payments');
      return z.array(PaymentResponseSchema).parse(response.data);
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

  getPaymentById: async (id: string): Promise<PaymentResponse> => {
    try {
      const response = await apiClient.get(`/payments/${encodeURIComponent(id)}`);
      return PaymentResponseSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};