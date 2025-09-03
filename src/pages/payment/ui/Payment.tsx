import { useParams } from 'react-router';
import { PageLayout } from '@/widgets/page-layout';
import { 
  useEventSession, 
  useSubscriptionPlans,
  useUserProfile
} from '@/shared/api';
import { usePaymentState, usePaymentProcessing, useInitialPlanSelection } from '../lib/hooks';
import { priceToMinor, calculatePrices } from '../lib/helpers';
import { ERROR_MESSAGES } from '../lib/constants';
import {
  ProductSelector,
  SubscriptionPlans,
  PriceBreakdown,
  PaymentOptions,
  PaymentSummary,
  LoadingState,
  ErrorState
} from './components';
import styles from './Payment.module.scss';

export function PaymentPage() {
  const { trainingId } = useParams<{ trainingId: string }>();
  
  // Fetch data
  const { data: session, isLoading: sessionLoading, error: sessionError } = useEventSession(trainingId!);
  const { data: subscriptionPlans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans(
    session ? { eventType: session.type } : undefined
  );
  const { data: user } = useUserProfile();
  
  // State management
  const {
    product,
    selectedPlanId,
    activeCashback,
    paymentError,
    updateProduct,
    updateSelectedPlan,
    updateActiveCashback,
    setPaymentError,
  } = usePaymentState();
  
  // Payment processing
  const { processPayment, isProcessing } = usePaymentProcessing(
    session || null,
    user || null,
    selectedPlanId,
    product
  );
  
  // Auto-select first plan when available
  useInitialPlanSelection(subscriptionPlans || [], selectedPlanId, updateSelectedPlan);
  
  // Calculate prices
  const selectedPlan = subscriptionPlans?.find(plan => plan.id === selectedPlanId);
  const subscriptionPrice = selectedPlan ? selectedPlan.priceMinor : 0;
  const sessionPrice = session ? priceToMinor(session.price) : 0;
  const cashbackValue = 20000; // Mock value - 200 rubles in kopecks
  
  const originalPrice = product === 'subscription' ? subscriptionPrice : sessionPrice;
  const { finalPrice } = calculatePrices(originalPrice, cashbackValue, activeCashback);
  
  const handlePayment = () => {
    processPayment(setPaymentError);
  };

  // Loading state
  if (sessionLoading || plansLoading) {
    return <LoadingState />;
  }

  // Error state
  if (sessionError || plansError) {
    return <ErrorState message={ERROR_MESSAGES.DATA_LOADING_ERROR} />;
  }

  // No session found
  if (!session) {
    return <ErrorState message={ERROR_MESSAGES.SESSION_NOT_FOUND} />;
  }

  return (
    <PageLayout title={session.title}>
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <ProductSelector
            selectedProduct={product}
            onProductChange={updateProduct}
          />

          <PriceBreakdown
            product={product}
            selectedPlan={selectedPlan}
            session={session}
            sessionPrice={sessionPrice}
            subscriptionPrice={subscriptionPrice}
          />

          {product === 'subscription' && subscriptionPlans && (
            <SubscriptionPlans
              plans={subscriptionPlans}
              selectedPlanId={selectedPlanId}
              onPlanSelect={updateSelectedPlan}
            />
          )}

          <div className={styles.divider} />

          <PaymentOptions
            cashbackValue={cashbackValue}
            activeCashback={activeCashback}
            onCashbackChange={updateActiveCashback}
          />
        </div>
        
        <PaymentSummary
          originalPrice={originalPrice}
          finalPrice={finalPrice}
          isProcessing={isProcessing}
          onPaymentClick={handlePayment}
          paymentError={paymentError}
        />
      </div>
    </PageLayout>
  )
}