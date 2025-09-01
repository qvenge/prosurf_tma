import { apiClient } from './config';
import { handleApiError } from './error-handler';
import {
  PurchaseSubscriptionSchema,
  SubscriptionResponseSchema,
  SubscriptionPlanResponseSchema,
  PurchaseSubscriptionResponseSchema,
  GetPlansQuerySchema,
  type PurchaseSubscription,
  type SubscriptionResponse,
  type SubscriptionPlanResponse,
  type PurchaseSubscriptionResponse,
  type GetPlansQuery,
} from './schemas';
import { z } from 'zod';

export const subscriptionsApi = {
  getSubscriptionPlans: async (query?: GetPlansQuery): Promise<SubscriptionPlanResponse[]> => {
    try {
      const params = query ? GetPlansQuerySchema.parse(query) : {};
      const response = await apiClient.get('/subscriptions/plans', { params });
      return z.array(SubscriptionPlanResponseSchema).parse(response.data);
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