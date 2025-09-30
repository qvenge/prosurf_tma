import { useState, useEffect } from 'react';
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
import { ERROR_MESSAGES } from './constants';
import { createIdempotencyKey } from './helpers';
import type { PaymentState, ProductType } from '../model/types';

export const usePaymentState = () => {
  const [state, setState] = useState<PaymentState>({
    product: 'subscription',
    selectedPlanId: '',
    activeCashback: false,
    paymentError: null,
  });

  const updateProduct = (product: ProductType) => {
    setState(prev => ({ ...prev, product, paymentError: null }));
  };

  const updateSelectedPlan = (selectedPlanId: string) => {
    setState(prev => ({ ...prev, selectedPlanId, paymentError: null }));
  };

  const updateActiveCashback = (activeCashback: boolean) => {
    setState(prev => ({ ...prev, activeCashback, paymentError: null }));
  };

  const setPaymentError = (paymentError: string | null) => {
    setState(prev => ({ ...prev, paymentError }));
  };

  return {
    ...state,
    updateProduct,
    updateSelectedPlan,
    updateActiveCashback,
    setPaymentError,
  };
};

export const usePaymentProcessing = (
  session: Session | null,
  user: User | null,
  selectedPlanId: string,
  product: ProductType,
  activeCashback: boolean,
  cashbackAmount: number
) => {
  const navigate = useNavigate();

  // Real API hooks
  const bookSession = useBookSession();
  const createPayment = useCreatePayment();
  const purchaseSeasonTicket = usePurchaseSeasonTicket();
  const { data: userBookingsData } = useCurrentUserBookings();
  const { handlePaymentAction } = usePaymentActions();

  const userBookings = userBookingsData?.items || [];

  const processPayment = async (setPaymentError: (error: string) => void) => {
    setPaymentError('');

    console.log('USER', user)
    
    if (!user) {
      console.log('USER NOT FOUND')
      return;
    }

    if (!session) {
      setPaymentError(ERROR_MESSAGES.SESSION_NOT_FOUND);
      return;
    }

    try {
      if (product === 'subscription') {
        await handleSubscriptionPayment(setPaymentError);
      } else {
        await handleSessionPayment(setPaymentError);
      }
    } catch (error: unknown) {
      console.error('Payment processing failed:', error);
      await handlePaymentError(error, setPaymentError);
    }
  };

  const handleSubscriptionPayment = async (setPaymentError: (error: string) => void) => {
    if (!selectedPlanId) {
      setPaymentError(ERROR_MESSAGES.PLAN_NOT_SELECTED);
      return;
    }

    // Build payment method request
    const paymentMethod: PaymentMethodRequest = buildPaymentMethodRequest();

    // Purchase season ticket with payment
    const payment = await purchaseSeasonTicket.mutateAsync({
      planId: selectedPlanId,
      paymentMethod,
      idempotencyKey: createIdempotencyKey(`plan-${selectedPlanId}`)
    });

    // Handle next action
    await handlePaymentNextAction(payment);
  };

  const handleSessionPayment = async (setPaymentError: (error: string) => void) => {
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
    const paymentMethod: PaymentMethodRequest = buildPaymentMethodRequest();

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
  const buildPaymentMethodRequest = (): PaymentMethodRequest => {
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
    if (!payment.nextAction) {
      console.warn('No next action in payment response');
      return;
    }

    await handlePaymentAction(payment);

    // Navigate to success page after handling action
    // The actual payment completion will be verified via webhook
    if (payment.nextAction.type === 'none') {
      // Payment completed immediately (e.g., full cashback or certificate)
      navigate('/payment-success');
    } else {
      // For openInvoice and redirect, user will return after payment
      // We should poll payment status or handle callback
      // TODO: Implement payment status polling in Phase 4
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

export const useInitialPlanSelection = (
  subscriptionPlans: Array<{ id: string }>,
  selectedPlanId: string,
  updateSelectedPlan: (id: string) => void
) => {
  useEffect(() => {
    if (subscriptionPlans && subscriptionPlans.length > 0 && !selectedPlanId) {
      updateSelectedPlan(subscriptionPlans[0].id);
    }
  }, [subscriptionPlans, selectedPlanId, updateSelectedPlan]);
};