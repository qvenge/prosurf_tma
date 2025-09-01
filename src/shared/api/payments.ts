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

  getPaymentById: async (id: string): Promise<PaymentResponse> => {
    try {
      const response = await apiClient.get(`/payments/${encodeURIComponent(id)}`);
      return PaymentResponseSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};