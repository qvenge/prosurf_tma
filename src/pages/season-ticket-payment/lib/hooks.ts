import { useNavigate } from '@/shared/navigation';
import {
  usePurchaseSeasonTicket,
  usePaymentActions,
} from '@/shared/api';
import {
  createIdempotencyKey,
  buildPaymentMethodRequest,
  handlePaymentNextAction,
} from '@/shared/lib/payment';
import { SEASON_TICKET_PAYMENT_ERRORS } from './constants';

/**
 * Season ticket payment processing hook
 * Handles standalone season ticket purchase
 */
export const useSeasonTicketPayment = () => {
  const navigate = useNavigate();

  // API hooks
  const purchaseSeasonTicket = usePurchaseSeasonTicket();
  const { handlePaymentAction } = usePaymentActions();

  /**
   * Process season ticket payment
   */
  const processPayment = async (
    selectedPlanId: string,
    activeBonus: boolean,
    bonusAmount: number,
    setPaymentError: (error: string) => void
  ) => {
    setPaymentError('');

    // Import logging utilities
    const { paymentLogger } = await import('@/shared/lib/payment-logger');
    const { paymentDebugger } = await import('@/shared/api/utils/payment-debugger');

    if (!selectedPlanId) {
      setPaymentError(SEASON_TICKET_PAYMENT_ERRORS.PLAN_NOT_SELECTED);
      paymentLogger.logError({
        error: SEASON_TICKET_PAYMENT_ERRORS.PLAN_NOT_SELECTED,
        context: 'processSeasonTicketPayment',
      });
      return;
    }

    // Start payment attempt
    const attemptId = paymentDebugger.startAttempt({
      amount: 0,
      currency: 'RUB',
      provider: 'telegram',
      metadata: {
        planId: selectedPlanId,
        activeBonus,
        bonusAmount,
      },
    });

    paymentLogger.logPaymentInitiated({
      amount: 0,
      currency: 'RUB',
      provider: 'telegram',
    });

    try {
      // Build payment method request
      const paymentMethod = buildPaymentMethodRequest(activeBonus, bonusAmount);

      // Purchase season ticket with payment
      const payment = await purchaseSeasonTicket.mutateAsync({
        planId: selectedPlanId,
        paymentMethod,
        idempotencyKey: createIdempotencyKey(`plan-${selectedPlanId}`),
      });

      // Handle next action
      await handlePaymentNextAction(payment, 'season-ticket', handlePaymentAction, navigate);
    } catch (error: unknown) {
      console.error('Season ticket payment processing failed:', error);

      paymentLogger.logPaymentFailed({
        error: error as Error | string,
        metadata: {
          attemptId,
          planId: selectedPlanId,
        },
      });

      paymentDebugger.endAttempt({
        success: false,
        error: error as Error | string,
      });

      await handlePaymentError(error, setPaymentError);
    }
  };

  /**
   * Handle payment errors
   */
  const handlePaymentError = async (error: unknown, setPaymentError: (error: string) => void) => {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Authentication required')) {
      console.log('Authentication required');
      return;
    } else if (errorMessage.includes('AMOUNT_MISMATCH')) {
      setPaymentError(SEASON_TICKET_PAYMENT_ERRORS.AMOUNT_MISMATCH);
    } else if (errorMessage.includes('PROVIDER_UNAVAILABLE')) {
      setPaymentError(SEASON_TICKET_PAYMENT_ERRORS.PROVIDER_UNAVAILABLE);
    } else if (errorMessage.includes('not found')) {
      setPaymentError(SEASON_TICKET_PAYMENT_ERRORS.PLAN_NOT_FOUND);
    } else {
      setPaymentError(SEASON_TICKET_PAYMENT_ERRORS.GENERIC_PAYMENT_ERROR);
    }
  };

  const isProcessing = purchaseSeasonTicket.isPending;

  return {
    processPayment,
    isProcessing,
  };
};
