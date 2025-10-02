import { useNavigate } from '@/shared/navigation';
import {
  usePurchaseSeasonTicket,
  usePaymentActions,
  type PaymentMethodRequest,
  type Payment
} from '@/shared/api';
import { ERROR_MESSAGES } from './constants';

// Helper to create idempotency keys
const createIdempotencyKey = (planId: string): string => {
  return `season-ticket-${planId}-${Date.now()}`;
};

export const usePaymentProcessing = () => {
  const navigate = useNavigate();

  // Real API hooks
  const purchaseSeasonTicket = usePurchaseSeasonTicket();
  const { handlePaymentAction } = usePaymentActions();

  const processPayment = async (
    selectedPlanId: string,
    activeCashback: boolean,
    cashbackAmount: number,
    setPaymentError: (error: string) => void
  ) => {
    setPaymentError('');

    // Import logging utilities
    const { paymentLogger } = await import('@/shared/lib/payment-logger');
    const { paymentDebugger } = await import('@/shared/api/utils/payment-debugger');

    if (!selectedPlanId) {
      setPaymentError(ERROR_MESSAGES.PLAN_NOT_SELECTED);
      paymentLogger.logError({
        error: ERROR_MESSAGES.PLAN_NOT_SELECTED,
        context: 'processPayment',
      });
      return;
    }

    // Start payment attempt
    const attemptId = paymentDebugger.startAttempt({
      amount: 0, // Will be calculated by backend
      currency: 'RUB',
      provider: 'telegram',
      metadata: {
        planId: selectedPlanId,
        activeCashback,
        cashbackAmount,
      },
    });

    paymentLogger.logPaymentInitiated({
      amount: 0,
      currency: 'RUB',
      provider: 'telegram',
    });

    try {
      // Build payment method request
      const paymentMethod: PaymentMethodRequest = buildPaymentMethodRequest(activeCashback, cashbackAmount);

      // Purchase season ticket with payment
      const payment = await purchaseSeasonTicket.mutateAsync({
        planId: selectedPlanId,
        paymentMethod,
        idempotencyKey: createIdempotencyKey(selectedPlanId)
      });

      // Handle next action
      await handlePaymentNextAction(payment);
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

  // Build payment method request based on selected options
  const buildPaymentMethodRequest = (activeCashback: boolean, cashbackAmount: number): PaymentMethodRequest => {
    // For now, support card with optional cashback
    // TODO: Add certificate support in Phase 3

    if (activeCashback && cashbackAmount > 0) {
      // Use composite payment: cashback + card
      // This will be refactored in Phase 3 to support CompositePaymentMethodRequest
      // For now, just use card as the API will handle partial cashback
      return {
        method: 'card',
        provider: 'telegram'
      };
    }

    // Simple card payment
    return {
      method: 'card',
      provider: 'telegram'
    };
  };

  // Handle payment next action
  const handlePaymentNextAction = async (payment: Payment) => {
    const { paymentLogger } = await import('@/shared/lib/payment-logger');
    const { paymentDebugger } = await import('@/shared/api/utils/payment-debugger');

    if (!payment.nextAction) {
      console.warn('No next action in payment response');
      paymentLogger.logError({
        error: 'No next action in payment response',
        context: 'handlePaymentNextAction',
        paymentId: payment.id,
        bookingId: payment.bookingId ?? undefined,
      });
      return;
    }

    paymentLogger.log({
      eventType: 'payment_api_response',
      paymentId: payment.id,
      bookingId: payment.bookingId ?? undefined,
      amount: payment.amount.amountMinor,
      currency: payment.amount.currency,
      status: payment.status,
      metadata: {
        nextActionType: payment.nextAction.type,
        provider: payment.provider,
      },
    });

    const result = await handlePaymentAction(payment);

    // End payment attempt in debugger
    paymentDebugger.endAttempt({
      success: result.success,
      invoiceStatus: result.status,
      error: result.error,
    });

    // Navigate based on result
    if (result.success) {
      // Payment completed or successfully initiated
      if (result.status === 'paid' || result.status === 'none') {
        paymentLogger.logPaymentCompleted({
          paymentId: payment.id,
          bookingId: payment.bookingId ?? undefined,
          amount: payment.amount.amountMinor,
          currency: payment.amount.currency,
        });
        // Navigate to season tickets list page
        navigate('payment-success?type=season-ticket');
      } else if (result.status === 'pending') {
        // For redirect payments, stay on page or navigate to pending page
        // TODO: Implement payment status polling
        console.log('Payment pending, implement status polling');
      }
    } else {
      // Payment failed or cancelled
      console.error('[Payment Flow] Season ticket payment action failed:', {
        status: result.status,
        error: result.error,
        paymentId: payment.id,
        bookingId: payment.bookingId ?? undefined,
      });

      // Error will be shown in UI via setPaymentError in parent function
    }
  };

  const handlePaymentError = async (error: unknown, setPaymentError: (error: string) => void) => {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Authentication required')) {
      console.log('Authentication required');
      return;
    } else if (errorMessage.includes('AMOUNT_MISMATCH')) {
      setPaymentError(ERROR_MESSAGES.AMOUNT_MISMATCH);
    } else if (errorMessage.includes('PROVIDER_UNAVAILABLE')) {
      setPaymentError(ERROR_MESSAGES.PROVIDER_UNAVAILABLE);
    } else if (errorMessage.includes('not found')) {
      setPaymentError(ERROR_MESSAGES.PLAN_NOT_FOUND);
    } else {
      setPaymentError(ERROR_MESSAGES.GENERIC_PAYMENT_ERROR);
    }
  };

  const isProcessing = purchaseSeasonTicket.isPending;

  return { processPayment, isProcessing };
};