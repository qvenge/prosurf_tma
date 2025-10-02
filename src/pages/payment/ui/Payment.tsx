import { useMemo } from 'react';
import { useParams } from 'react-router';
import { PageLayout } from '@/widgets/page-layout';
import {
  PaymentPageLayout,
  usePaymentState,
  useInitialPlanSelection,
  calculatePrices,
  type TabConfig,
  type ProductType,
  type PaymentOptionsConfig,
  type PaymentSummaryConfig,
} from '@/widgets/payment-page-layout';
import {
  useSession,
  useCurrentUserProfile,
  useCurrentUserCashback,
  useSeasonTicketPlans
} from '@/shared/api';
import { usePaymentProcessing } from '../lib/hooks';
import { ERROR_MESSAGES } from '../lib/constants';
import { LoadingState, ErrorState } from './components';
import { PriceBreakdown, SubscriptionPlans } from '@/widgets/payment-page-layout/ui/components';

export function PaymentPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  // Fetch data
  const { data: session, isLoading: sessionLoading, error: sessionError } = useSession(sessionId!);
  const { user, isLoading: userLoading } = useCurrentUserProfile();
  const { data: cashbackWallet, isLoading: cashbackLoading } = useCurrentUserCashback();
  const { data: plansData, isLoading: plansLoading, error: plansError } = useSeasonTicketPlans();

  const subscriptionPlans = plansData?.items || [];
  const cashbackValue = cashbackWallet?.balance.amountMinor || 0;

  // State management from widget hooks
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

  // Auto-select first plan
  useInitialPlanSelection(subscriptionPlans, selectedPlanId, updateSelectedPlan);

  // Payment processing hook
  const { processPayment, isProcessing } = usePaymentProcessing(
    session || null,
    user || null
  );

  // Calculate prices
  const selectedPlan = subscriptionPlans.find((plan) => plan.id === selectedPlanId);
  const subscriptionPrice = selectedPlan?.price.amountMinor || 0;
  const sessionPrice = session?.event?.tickets?.[0]?.prepayment?.price?.amountMinor || 0;
  const originalPrice = product === 'subscription' ? subscriptionPrice : sessionPrice;
  const { finalPrice } = calculatePrices(originalPrice, cashbackValue, activeCashback);

  // Handler for payment
  const handlePayment = () => {
    processPayment(
      selectedPlanId,
      product,
      activeCashback,
      activeCashback ? cashbackValue : 0,
      setPaymentError
    );
  };

  // Combined loading state
  const isLoading = sessionLoading || userLoading || cashbackLoading || plansLoading;

  // Error state
  if (sessionError || plansError) {
    return (
      <PageLayout title="Оплата">
        <ErrorState message={ERROR_MESSAGES.DATA_LOADING_ERROR} />
      </PageLayout>
    );
  }

  // No session found
  if (!isLoading && !session) {
    return (
      <PageLayout title="Оплата">
        <ErrorState message={ERROR_MESSAGES.SESSION_NOT_FOUND} />
      </PageLayout>
    );
  }

  // Show loading until we have session data
  if (isLoading || !session) {
    return (
      <PageLayout title="Оплата">
        <LoadingState />
      </PageLayout>
    );
  }

  // Configure tabs with content - FULLY CONFIGURABLE!
  const tabs: TabConfig<ProductType>[] = useMemo(() => [
    {
      id: 'subscription',
      label: 'Абонемент',
      content: (
        <>
          <PriceBreakdown
            product="subscription"
            selectedPlan={selectedPlan}
            session={{
              title: session.event.title,
              type: 'other' as const,
              price: session.event.tickets[0]?.prepayment?.price
                ? {
                    amount: String(session.event.tickets[0].prepayment?.price.amountMinor / 100),
                    currency: session.event.tickets[0].prepayment?.price.currency,
                  }
                : { amount: '0', currency: 'RUB' },
            }}
            sessionPrice={sessionPrice}
            subscriptionPrice={subscriptionPrice}
          />
          {subscriptionPlans.length > 0 && (
            <SubscriptionPlans
              plans={subscriptionPlans}
              selectedPlanId={selectedPlanId}
              onPlanSelect={updateSelectedPlan}
            />
          )}
        </>
      ),
    },
    {
      id: 'single_session',
      label: 'Разовая тренировка',
      content: (
        <PriceBreakdown
          product="single_session"
          selectedPlan={selectedPlan}
          session={{
            title: session.event.title,
            type: 'other' as const,
            price: session.event.tickets[0]?.prepayment?.price
              ? {
                  amount: String(session.event.tickets[0].prepayment?.price.amountMinor / 100),
                  currency: session.event.tickets[0].prepayment?.price.currency,
                }
              : { amount: '0', currency: 'RUB' },
          }}
          sessionPrice={sessionPrice}
          subscriptionPrice={subscriptionPrice}
        />
      ),
    },
  ], [selectedPlan, session, sessionPrice, subscriptionPrice, subscriptionPlans, selectedPlanId, updateSelectedPlan]);

  // Payment options configuration
  const paymentOptions: PaymentOptionsConfig = {
    cashback: {
      enabled: cashbackValue > 0,
      value: cashbackValue,
      active: activeCashback,
      onChange: updateActiveCashback,
    },
    // Certificate disabled for now
    certificate: {
      enabled: false,
      value: 0,
      active: false,
      onChange: () => {},
    },
  };

  // Payment summary configuration
  const summary: PaymentSummaryConfig = {
    originalPrice,
    finalPrice,
    onPayment: handlePayment,
    isProcessing,
    error: paymentError,
  };

  return (
    <PageLayout title="Оплата">
      <PaymentPageLayout
        tabs={tabs}
        activeTab={product}
        onTabChange={updateProduct}
        paymentOptions={paymentOptions}
        summary={summary}
      />
    </PageLayout>
  );
}
