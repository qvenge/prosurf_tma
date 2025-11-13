import { apiClient, validateResponse } from '../config';
import { 
  CashbackRulesSchema
} from '../schemas';
import type { 
  CashbackRules
} from '../types';

/**
 * Cashback API client
 */
export const cashbackClient = {
  /**
   * Get cashback rules (read-only)
   * GET /cashback/rules
   */
  async getCashbackRules(): Promise<CashbackRules> {
    const response = await apiClient.get('/cashback/rules');
    return validateResponse(response.data, CashbackRulesSchema);
  },

  // Note: Client cashback wallet is accessed through clientsClient.getMyCashback()
};