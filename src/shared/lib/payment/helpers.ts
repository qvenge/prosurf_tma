import type { PaymentRequest, Payment } from '@/shared/api';
import type { SuccessPageType } from './types';

/**
 * Create stable idempotency key for payment retries
 * Uses only the prefix (e.g., 'payment-{bookingId}') without timestamp
 * to ensure same key is used for all retry attempts of the same payment
 */
export const createIdempotencyKey = (prefix: string): string => {
  return prefix;
};

/**
 * Determine success page type based on event labels
 */
export const getSuccessTypeFromEventLabels = (
  labels: string[] | null | undefined
): SuccessPageType => {
  if (!labels || labels.length === 0) {
    return 'training';
  }

  // Check for tour or activity
  if (labels.includes('tour')) return 'tour';
  if (labels.includes('activity')) return 'activity';

  // All training types map to 'training'
  return 'training';
};

/**
 * Build payment method request based on selected options
 * Returns array of payment methods (simplified structure)
 */
export const buildPaymentMethodRequest = (
  activeBonus: boolean,
  bonusAmountMinor: number,
  currency: string = 'RUB'
): PaymentRequest => {
  if (activeBonus && bonusAmountMinor > 0) {
    // Composite payment: bonus + card
    return [
      {
        method: 'bonus',
        amount: { currency, amountMinor: bonusAmountMinor },
      },
      {
        method: 'card',
        provider: 'telegram',
      },
    ];
  }

  // Simple card payment (single element array)
  return [
    {
      method: 'card',
      provider: 'telegram',
    },
  ];
};

/**
 * Handle payment next action and navigation
 * @param payment - Payment object from API
 * @param successType - Type of success page to navigate to
 * @param handlePaymentAction - Function to handle Telegram payment action
 * @param navigate - Navigation function
 */
export const handlePaymentNextAction = async (
  payment: Payment,
  successType: SuccessPageType,
  handlePaymentAction: (payment: Payment) => Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }>,
  navigate: (path: string) => void
) => {
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

      navigate(`payment-success?type=${successType}`);
    } else if (result.status === 'pending') {
      // For redirect payments, stay on page or navigate to pending page
      // TODO: Implement payment status polling
      console.log('Payment pending, implement status polling');
    }
  } else {
    // Payment failed or cancelled
    console.error('[Payment Flow] Payment action failed:', {
      status: result.status,
      error: result.error,
      paymentId: payment.id,
      bookingId: payment.bookingId ?? undefined,
    });

    // Error will be shown in UI via setPaymentError in parent function
  }
};
