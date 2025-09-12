import { useQuery } from '@tanstack/react-query';
import { cashbackClient } from '../clients/cashback';

export const cashbackKeys = {
  all: ['cashback'] as const,
  rules: () => [...cashbackKeys.all, 'rules'] as const,
} as const;

export const useCashbackRules = () => {
  return useQuery({
    queryKey: cashbackKeys.rules(),
    queryFn: () => cashbackClient.getCashbackRules(),
    staleTime: 30 * 60 * 1000, // 30 minutes - rules don't change often
  });
};