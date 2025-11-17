import { useNavigate } from '@/shared/navigation';
import {
  useBookSession,
  useCreatePayment,
  usePurchaseSeasonTicket,
  useCurrentUserBookings,
  usePaymentActions,
  type Session,
  type User,
  type Client,
  type PaymentRequest,
  type Payment
} from '@/shared/api';
import type { ProductType } from '@/widgets/payment-page-layout';
import { ERROR_MESSAGES } from './constants';

// Payment context type
type PaymentContext = 'session' | 'season-ticket';

// Success page type for navigation
type SuccessPageType = 'training' | 'activity' | 'tour' | 'season-ticket';

// Helper to create idempotency keys
const createIdempotencyKey = (prefix: string): string => {
  return `${prefix}-${Date.now()}`;
};

// Helper to determine success page type based on event labels
const getSuccessTypeFromEventLabels = (labels: string[] | null | undefined): SuccessPageType => {
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
 * Unified payment processing hook for both session and season ticket payments
 * @param session - Optional session data (required for session payment context)
 * @param user - Optional user data (required for session payment context)
 */
export const usePaymentProcessing = (
  session: Session | null = null,
  user: User | Client | null = null
) => {
  const navigate = useNavigate();

  // Real API hooks
  const bookSession = useBookSession();
  const createPayment = useCreatePayment();
  const purchaseSeasonTicket = usePurchaseSeasonTicket();
  const { data: userBookingsData } = useCurrentUserBookings();
  const { handlePaymentAction } = usePaymentActions();

  const userBookings = userBookingsData?.items || [];

  /**
   * Process session payment (with product type selection)
   */
  const processSessionPayment = async (
    selectedPlanId: string,
    product: ProductType,
    activeCashback: boolean,
    cashbackAmount: number,
    cashbackCurrency: string,
    setPaymentError: (error: string) => void
  ) => {
    setPaymentError('');

    // Import logging utilities
    const { paymentLogger } = await import('@/shared/lib/payment-logger');
    const { paymentDebugger } = await import('@/shared/api/utils/payment-debugger');

    if (!user) {
      paymentLogger.logError({
        error: 'User not found',
        context: 'processSessionPayment',
      });
      return;
    }

    if (!session) {
      setPaymentError(ERROR_MESSAGES.SESSION_NOT_FOUND);
      paymentLogger.logError({
        error: ERROR_MESSAGES.SESSION_NOT_FOUND,
        context: 'processSessionPayment',
      });
      return;
    }

    // Calculate amount for logging
    const sessionPrice = session.event?.tickets?.[0]?.prepayment?.price?.amountMinor || 0;
    const amount = product === 'subscription' ? 0 : sessionPrice;

    // Start payment attempt
    const attemptId = paymentDebugger.startAttempt({
      sessionId: session.id,
      eventId: session.event.id,
      eventTitle: session.event.title,
      userId: user.id,
      userEmail: user.email || undefined,
      amount,
      currency: 'RUB',
      provider: 'telegram',
      metadata: {
        product,
        selectedPlanId,
        activeCashback,
        cashbackAmount,
      },
    });

    paymentLogger.logPaymentInitiated({
      sessionId: session.id,
      amount,
      currency: 'RUB',
      provider: 'telegram',
    });

    try {
      if (product === 'subscription') {
        await handleSubscriptionPayment(selectedPlanId, activeCashback, cashbackAmount, cashbackCurrency, setPaymentError, 'season-ticket');
      } else {
        await handleSessionPayment(activeCashback, cashbackAmount, cashbackCurrency, setPaymentError);
      }
    } catch (error: unknown) {
      console.error('Session payment processing failed:', error);

      paymentLogger.logPaymentFailed({
        error: error as Error | string,
        metadata: {
          attemptId,
          product,
          sessionId: session.id,
        },
      });

      paymentDebugger.endAttempt({
        success: false,
        error: error as Error | string,
      });

      await handlePaymentError(error, setPaymentError, 'session');
    }
  };

  /**
   * Process season ticket payment (standalone purchase)
   */
  const processSeasonTicketPayment = async (
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
      await handleSubscriptionPayment(selectedPlanId, activeCashback, cashbackAmount, 'RUB', setPaymentError, 'season-ticket');
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

      await handlePaymentError(error, setPaymentError, 'season-ticket');
    }
  };

  const handleSubscriptionPayment = async (
    selectedPlanId: string,
    activeCashback: boolean,
    cashbackAmount: number,
    cashbackCurrency: string,
    setPaymentError: (error: string) => void,
    successType: SuccessPageType
  ) => {
    if (!selectedPlanId) {
      setPaymentError(ERROR_MESSAGES.PLAN_NOT_SELECTED);
      return;
    }

    // Build payment method request
    const paymentMethod = buildPaymentMethodRequest(activeCashback, cashbackAmount, cashbackCurrency);

    // Purchase season ticket with payment
    const payment = await purchaseSeasonTicket.mutateAsync({
      planId: selectedPlanId,
      paymentMethod,
      idempotencyKey: createIdempotencyKey(`plan-${selectedPlanId}`)
    });

    // Handle next action
    await handlePaymentNextAction(payment, successType);
  };

  const handleSessionPayment = async (
    activeCashback: boolean,
    cashbackAmount: number,
    cashbackCurrency: string,
    setPaymentError: (error: string) => void
  ) => {
    if (!session) {
      setPaymentError(ERROR_MESSAGES.SESSION_NOT_FOUND);
      return;
    }

    // Determine success page type based on event labels
    const successType = getSuccessTypeFromEventLabels(session.event.labels);

    // Check for existing HOLD booking
    const existingBooking = userBookings.find(
      (booking) => booking.sessionId === session.id && booking.status === 'HOLD'
    );

    let bookingId: string;

    if (existingBooking) {
      bookingId = existingBooking.id;
      console.log('Using existing booking:', bookingId);
    } else {
      // Create new booking
      const result = await bookSession.mutateAsync({
        sessionId: session.id,
        data: { quantity: 1 }, // BookRequest: just quantity
        idempotencyKey: createIdempotencyKey(`booking-${session.id}`)
      });
      bookingId = result.booking.id;
      console.log('Created new booking:', bookingId);

      // TODO: Display hold TTL to user (result.holdTtlSeconds)
    }

    // Build payment method request
    const paymentMethod = buildPaymentMethodRequest(activeCashback, cashbackAmount, cashbackCurrency);

    // Create payment for booking
    const payment = await createPayment.mutateAsync({
      bookingId,
      data: paymentMethod,
      idempotencyKey: createIdempotencyKey(`payment-${bookingId}`)
    });

    // Handle next action
    await handlePaymentNextAction(payment, successType);
  };

  // Build payment method request based on selected options
  const buildPaymentMethodRequest = (
    activeCashback: boolean,
    cashbackAmount: number,
    cashbackCurrency: string
  ): PaymentRequest => {
    if (activeCashback && cashbackAmount > 0) {
      // Use composite payment: cashback + card
      return {
        methods: [
          {
            method: 'cashback',
            amount: {
              currency: cashbackCurrency,
              amountMinor: cashbackAmount
            }
          },
          {
            method: 'card',
            provider: 'telegram'
          }
        ]
      };
    }

    // Simple card payment
    return {
      method: 'card',
      provider: 'telegram'
    };
  };

  // Handle payment next action
  const handlePaymentNextAction = async (payment: Payment, successType: SuccessPageType) => {
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

  const handlePaymentError = async (
    error: unknown,
    setPaymentError: (error: string) => void,
    paymentContext: PaymentContext
  ) => {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Authentication required')) {
      console.log('Authentication required');
      return;
    } else if (errorMessage.includes('HOLD_EXPIRED')) {
      setPaymentError('Время бронирования истекло. Пожалуйста, создайте новое бронирование.');
    } else if (errorMessage.includes('NO_SEATS')) {
      setPaymentError(ERROR_MESSAGES.NO_SEATS_AVAILABLE);
    } else if (errorMessage.includes('AMOUNT_MISMATCH')) {
      setPaymentError(ERROR_MESSAGES.AMOUNT_MISMATCH);
    } else if (errorMessage.includes('PROVIDER_UNAVAILABLE')) {
      setPaymentError(ERROR_MESSAGES.PROVIDER_UNAVAILABLE);
    } else if (errorMessage.includes('not found')) {
      setPaymentError(paymentContext === 'session' ? ERROR_MESSAGES.TRAINING_NOT_FOUND : ERROR_MESSAGES.PLAN_NOT_FOUND);
    } else {
      setPaymentError(ERROR_MESSAGES.GENERIC_PAYMENT_ERROR);
    }
  };

  const isProcessing = bookSession.isPending || purchaseSeasonTicket.isPending || createPayment.isPending;

  return {
    processSessionPayment,
    processSeasonTicketPayment,
    isProcessing,
  };
};