import { useQuery } from '@tanstack/react-query';
import { bonusClient } from '../clients/bonus';

export const bonusKeys = {
  all: ['bonus'] as const,
  rules: () => [...bonusKeys.all, 'rules'] as const,
} as const;

export const useBonusRules = () => {
  return useQuery({
    queryKey: bonusKeys.rules(),
    queryFn: () => bonusClient.getBonusRules(),
    staleTime: 30 * 60 * 1000, // 30 minutes - rules don't change often
  });
};