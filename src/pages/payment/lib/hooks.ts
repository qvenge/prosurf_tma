import { useNavigate } from '@/shared/navigation';
import {
  useBookSession,
  useCreatePayment,
  usePurchaseSeasonTicket,
  useCurrentUserBookings,
  usePaymentActions,
  type Session,
  type User,
  type PaymentMethodRequest,
  type Payment
} from '@/shared/api';
import type { ProductType } from '@/widgets/payment-page-layout';
import { ERROR_MESSAGES } from './constants';

// Helper to create idempotency keys
const createIdempotencyKey = (sessionId: string): string => {
  return `booking-${sessionId}-${Date.now()}`;
};

export const usePaymentProcessing = (
  session: Session | null,
  user: User | null
) => {
  const navigate = useNavigate();

  // Real API hooks
  const bookSession = useBookSession();
  const createPayment = useCreatePayment();
  const purchaseSeasonTicket = usePurchaseSeasonTicket();
  const { data: userBookingsData } = useCurrentUserBookings();
  const { handlePaymentAction } = usePaymentActions();

  const userBookings = userBookingsData?.items || [];

  const processPayment = async (
    selectedPlanId: string,
    product: ProductType,
    activeCashback: boolean,
    cashbackAmount: number,
    setPaymentError: (error: string) => void
  ) => {
    setPaymentError('');

    // Import logging utilities
    const { paymentLogger } = await import('@/shared/lib/payment-logger');
    const { paymentDebugger } = await import('@/shared/api/utils/payment-debugger');

    if (!user) {
      paymentLogger.logError({
        error: 'User not found',
        context: 'processPayment',
      });
      return;
    }

    if (!session) {
      setPaymentError(ERROR_MESSAGES.SESSION_NOT_FOUND);
      paymentLogger.logError({
        error: ERROR_MESSAGES.SESSION_NOT_FOUND,
        context: 'processPayment',
      });
      return;
    }

    // Calculate amount for logging
    const sessionPrice = session.event?.tickets?.[0]?.prepayment?.price?.amountMinor || 0;
    const amount = product === 'subscription' ? 0 : sessionPrice; // Will be updated with actual subscription price

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
        await handleSubscriptionPayment(selectedPlanId, activeCashback, cashbackAmount, setPaymentError);
      } else {
        await handleSessionPayment(activeCashback, cashbackAmount, setPaymentError);
      }
    } catch (error: unknown) {
      console.error('Payment processing failed:', error);

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

      await handlePaymentError(error, setPaymentError);
    }
  };

  const handleSubscriptionPayment = async (
    selectedPlanId: string,
    activeCashback: boolean,
    cashbackAmount: number,
    setPaymentError: (error: string) => void
  ) => {
    if (!selectedPlanId) {
      setPaymentError(ERROR_MESSAGES.PLAN_NOT_SELECTED);
      return;
    }

    // Build payment method request
    const paymentMethod: PaymentMethodRequest = buildPaymentMethodRequest(activeCashback, cashbackAmount);

    // Purchase season ticket with payment
    const payment = await purchaseSeasonTicket.mutateAsync({
      planId: selectedPlanId,
      paymentMethod,
      idempotencyKey: createIdempotencyKey(`plan-${selectedPlanId}`)
    });

    // Handle next action
    await handlePaymentNextAction(payment);
  };

  const handleSessionPayment = async (
    activeCashback: boolean,
    cashbackAmount: number,
    setPaymentError: (error: string) => void
  ) => {
    if (!session) {
      setPaymentError(ERROR_MESSAGES.SESSION_NOT_FOUND);
      return;
    }

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
        idempotencyKey: createIdempotencyKey(session.id)
      });
      bookingId = result.booking.id;
      console.log('Created new booking:', bookingId);

      // TODO: Display hold TTL to user (result.holdTtlSeconds)
    }

    // Build payment method request
    const paymentMethod: PaymentMethodRequest = buildPaymentMethodRequest(activeCashback, cashbackAmount);

    // Create payment for booking
    const payment = await createPayment.mutateAsync({
      bookingId,
      data: paymentMethod,
      idempotencyKey: createIdempotencyKey(`payment-${bookingId}`)
    });

    // Handle next action
    await handlePaymentNextAction(payment);
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

        navigate('payment-success?type=training:surfing');

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

  const handlePaymentError = async (error: unknown, setPaymentError: (error: string) => void) => {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Authentication required')) {
      console.log('Authentication required');
      return;
    } else if (errorMessage.includes('HOLD_EXPIRED')) {
      setPaymentError('Время бронирования истекло. Пожалуйста, создайте новое бронирование.');
    } else if (errorMessage.includes('NO_SEATS')) {
      setPaymentError(ERROR_MESSAGES.NO_SEATS_AVAILABLE);
    } else if (errorMessage.includes('AMOUNT_MISMATCH')) {
      setPaymentError('Несоответствие суммы платежа. Попробуйте снова.');
    } else if (errorMessage.includes('PROVIDER_UNAVAILABLE')) {
      setPaymentError('Платежная система временно недоступна. Попробуйте позже.');
    } else if (errorMessage.includes('not found')) {
      setPaymentError(ERROR_MESSAGES.TRAINING_NOT_FOUND);
    } else {
      setPaymentError(ERROR_MESSAGES.GENERIC_PAYMENT_ERROR);
    }
  };

  const isProcessing = bookSession.isPending || purchaseSeasonTicket.isPending || createPayment.isPending;

  return { processPayment, isProcessing };
};