import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  useCreateBooking, 
  usePurchaseSubscription, 
  useCreatePaymentIntent, 
  useUserBookings 
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

interface Session {
  id: string;
  title: string;
  type: 'surfingTraining' | 'surfskateTraining' | 'tour' | 'other';
  location: string;
  capacity: number;
  start: string;
  end: string | null;
  price: { currency: 'RUB' | 'USD'; amount: string };
  remainingSeats: number;
  description: Array<{ heading: string; body: string }>;
  bookingPrice?: { currency: 'RUB' | 'USD'; amount: string } | null;
}

interface User {
  id: string;
  email: string;
}

export const usePaymentProcessing = (
  session: Session | null,
  user: User | null,
  selectedPlanId: string,
  product: ProductType
) => {
  const navigate = useNavigate();
  const createBooking = useCreateBooking();
  const purchaseSubscription = usePurchaseSubscription();
  const createPaymentIntent = useCreatePaymentIntent();
  const { data: userBookings } = useUserBookings();

  const processPayment = async (setPaymentError: (error: string) => void) => {
    setPaymentError('');
    
    if (!user) {
      navigate('/auth/login');
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

    const result = await purchaseSubscription.mutateAsync({
      planId: selectedPlanId
    });

    await redirectToPayment(result, setPaymentError);
  };

  const handleSessionPayment = async (setPaymentError: (error: string) => void) => {
    if (!session) {
      setPaymentError(ERROR_MESSAGES.SESSION_NOT_FOUND);
      return;
    }

    const existingBooking = userBookings?.find(
      booking => booking.sessionId === session.id && booking.status === 'HOLD'
    );

    let bookingId: string;

    if (existingBooking) {
      bookingId = existingBooking.id;
      console.log('Using existing booking:', bookingId);
    } else {
      const booking = await createBooking.mutateAsync({
        sessionId: session.id,
        idempotencyKey: createIdempotencyKey(session.id)
      });
      bookingId = booking.id;
      console.log('Created new booking:', bookingId);
    }

    const paymentResult = await createPaymentIntent.mutateAsync({
      bookingId: bookingId,
      method: 'PAYMENT'
    });

    await redirectToPayment(paymentResult, setPaymentError);
  };

  const redirectToPayment = async (result: { checkoutUrl?: string | null; clientSecret?: string | null }, setPaymentError: (error: string) => void) => {
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    } else if (result.clientSecret) {
      window.location.href = result.clientSecret;
    } else {
      setPaymentError(ERROR_MESSAGES.PAYMENT_CREATION_FAILED);
    }
  };

  const handlePaymentError = async (error: unknown, setPaymentError: (error: string) => void) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('Authentication required')) {
      navigate('/auth/login');
    } else if (errorMessage.includes('already have an active booking')) {
      await handleExistingBookingError(setPaymentError);
    } else if (errorMessage.includes('no seats available')) {
      setPaymentError(ERROR_MESSAGES.NO_SEATS_AVAILABLE);
    } else if (errorMessage.includes('not found')) {
      setPaymentError(ERROR_MESSAGES.TRAINING_NOT_FOUND);
    } else {
      setPaymentError(ERROR_MESSAGES.GENERIC_PAYMENT_ERROR);
    }
  };

  const handleExistingBookingError = async (setPaymentError: (error: string) => void) => {
    const existingBooking = userBookings?.find(
      booking => booking.sessionId === session?.id && booking.status === 'HOLD'
    );
    
    if (existingBooking) {
      try {
        const paymentResult = await createPaymentIntent.mutateAsync({
          bookingId: existingBooking.id,
          method: 'PAYMENT'
        });

        await redirectToPayment(paymentResult, setPaymentError);
        return;
      } catch (paymentError) {
        console.error('Failed to create payment for existing booking:', paymentError);
      }
    }
    
    setPaymentError(ERROR_MESSAGES.EXISTING_BOOKING);
  };

  const isProcessing = createBooking.isPending || purchaseSubscription.isPending || createPaymentIntent.isPending;

  return { processPayment, isProcessing };
};

interface SubscriptionPlan {
  id: string;
  name: string;
  sessionsTotal: number;
  priceMinor: number;
}

export const useInitialPlanSelection = (subscriptionPlans: SubscriptionPlan[], selectedPlanId: string, updateSelectedPlan: (id: string) => void) => {
  useEffect(() => {
    if (subscriptionPlans && subscriptionPlans.length > 0 && !selectedPlanId) {
      updateSelectedPlan(subscriptionPlans[0].id);
    }
  }, [subscriptionPlans, selectedPlanId, updateSelectedPlan]);
};