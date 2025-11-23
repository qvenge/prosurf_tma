import { COMMON_PAYMENT_ERRORS, PLANS_ERRORS } from '@/shared/lib/payment';

// Season ticket payment specific error messages
export const SEASON_TICKET_PAYMENT_ERRORS = {
  ...COMMON_PAYMENT_ERRORS,
  ...PLANS_ERRORS,
} as const;
