import { apiClient } from './config';
import { handleApiError } from './error-handler';
import {
  PurchaseSubscriptionSchema,
  SubscriptionResponseSchema,
  PurchaseSubscriptionResponseSchema,
  type PurchaseSubscription,
  type SubscriptionResponse,
  type PurchaseSubscriptionResponse,
} from './schemas';
import { z } from 'zod';

export const subscriptionsApi = {
  getUserSubscriptions: async (userId: string): Promise<SubscriptionResponse[]> => {
    try {
      const response = await apiClient.get(`/users/${encodeURIComponent(userId)}/subscriptions`);
      return z.array(SubscriptionResponseSchema).parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAllSubscriptions: async (): Promise<SubscriptionResponse[]> => {
    try {
      const response = await apiClient.get('/subscriptions');
      return z.array(SubscriptionResponseSchema).parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  purchaseSubscription: async (data: PurchaseSubscription): Promise<PurchaseSubscriptionResponse> => {
    try {
      const validatedData = PurchaseSubscriptionSchema.parse(data);
      const response = await apiClient.post('/subscriptions/purchase', validatedData);
      return PurchaseSubscriptionResponseSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};