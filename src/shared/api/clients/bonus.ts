import { apiClient, validateResponse } from '../config';
import {
  BonusRulesSchema
} from '../schemas';
import type {
  BonusRules
} from '../types';

/**
 * Bonus API client
 */
export const bonusClient = {
  /**
   * Get bonus rules (read-only)
   * GET /bonus/rules
   */
  async getBonusRules(): Promise<BonusRules> {
    const response = await apiClient.get('/bonus/rules');
    return validateResponse(response.data, BonusRulesSchema);
  },

  // Note: Client bonus wallet is accessed through clientsClient.getMyBonus()
};