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
} from '@/shared/api';
import type { ProductType } from '@/widgets/payment-page-layout';
import {
  createIdempotencyKey,
  buildPaymentMethodRequest,
  handlePaymentNextAction,
  getSuccessTypeFromEventLabels,
} from '@/shared/lib/payment';
import { SESSION_PAYMENT_ERRORS } from './constants';

/**
 * Session payment processing hook
 * Handles both single session and subscription (season ticket) payments
 */
export const useSessionPayment = (session: Session | null, user: User | Client | null) => {
  const navigate = useNavigate();

  // API hooks
  const bookSession = useBookSession();
  const createPayment = useCreatePayment();
  const purchaseSeasonTicket = usePurchaseSeasonTicket();
  const { data: userBookingsData } = useCurrentUserBookings();
  const { handlePaymentAction } = usePaymentActions();

  const userBookings = userBookingsData?.items || [];

  /**
   * Process session payment - handles both single session and subscription
   */
  const processPayment = async (
    selectedPlanId: string,
    product: ProductType,
    activeBonus: boolean,
    bonusAmount: number,
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
      setPaymentError(SESSION_PAYMENT_ERRORS.SESSION_NOT_FOUND);
      paymentLogger.logError({
        error: SESSION_PAYMENT_ERRORS.SESSION_NOT_FOUND,
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
        activeBonus,
        bonusAmount,
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
        await handleSubscriptionPayment(
          selectedPlanId,
          activeBonus,
          bonusAmount,
          setPaymentError
        );
      } else {
        await handleSingleSessionPayment(
          activeBonus,
          bonusAmount,
          setPaymentError
        );
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

      await handlePaymentError(error, setPaymentError);
    }
  };

  /**
   * Handle subscription (season ticket) payment within session context
   */
  const handleSubscriptionPayment = async (
    selectedPlanId: string,
    activeBonus: boolean,
    bonusAmount: number,
    setPaymentError: (error: string) => void
  ) => {
    if (!selectedPlanId) {
      setPaymentError('Выберите план абонемента');
      return;
    }

    // Build payment method request
    const paymentMethod = buildPaymentMethodRequest(activeBonus, bonusAmount);

    // Purchase season ticket with payment
    const payment = await purchaseSeasonTicket.mutateAsync({
      planId: selectedPlanId,
      paymentMethod,
      idempotencyKey: createIdempotencyKey(`plan-${selectedPlanId}`),
    });

    // Navigate to season-ticket success page
    await handlePaymentNextAction(payment, 'season-ticket', handlePaymentAction, navigate);
  };

  /**
   * Handle single session payment
   */
  const handleSingleSessionPayment = async (
    activeBonus: boolean,
    bonusAmount: number,
    setPaymentError: (error: string) => void
  ) => {
    if (!session) {
      setPaymentError(SESSION_PAYMENT_ERRORS.SESSION_NOT_FOUND);
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
        idempotencyKey: createIdempotencyKey(`booking-${session.id}`),
      });
      bookingId = result.booking.id;
      console.log('Created new booking:', bookingId);

      // TODO: Display hold TTL to user (result.holdTtlSeconds)
    }

    // Build payment method request
    const paymentMethod = buildPaymentMethodRequest(activeBonus, bonusAmount);

    // Create payment for booking
    const payment = await createPayment.mutateAsync({
      bookingId,
      data: paymentMethod,
      idempotencyKey: createIdempotencyKey(`payment-${bookingId}`),
    });

    // Handle next action
    await handlePaymentNextAction(payment, successType, handlePaymentAction, navigate);
  };

  /**
   * Handle payment errors
   */
  const handlePaymentError = async (error: unknown, setPaymentError: (error: string) => void) => {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('Authentication required')) {
      console.log('Authentication required');
      return;
    } else if (errorMessage.includes('HOLD_EXPIRED')) {
      setPaymentError('Время бронирования истекло. Пожалуйста, создайте новое бронирование.');
    } else if (errorMessage.includes('NO_SEATS')) {
      setPaymentError(SESSION_PAYMENT_ERRORS.NO_SEATS_AVAILABLE);
    } else if (errorMessage.includes('AMOUNT_MISMATCH')) {
      setPaymentError(SESSION_PAYMENT_ERRORS.AMOUNT_MISMATCH);
    } else if (errorMessage.includes('PROVIDER_UNAVAILABLE')) {
      setPaymentError(SESSION_PAYMENT_ERRORS.PROVIDER_UNAVAILABLE);
    } else if (errorMessage.includes('not found')) {
      setPaymentError(SESSION_PAYMENT_ERRORS.TRAINING_NOT_FOUND);
    } else {
      setPaymentError(SESSION_PAYMENT_ERRORS.GENERIC_PAYMENT_ERROR);
    }
  };

  const isProcessing = bookSession.isPending || purchaseSeasonTicket.isPending || createPayment.isPending;

  return {
    processPayment,
    isProcessing,
  };
};
