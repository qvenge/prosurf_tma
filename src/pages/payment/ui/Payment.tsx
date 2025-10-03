import { useEffect, useMemo } from 'react';
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
import { PriceBreakdown, SeasonTicketPlans } from '@/widgets/payment-page-layout';
import { pluralize, getSessionType } from '@/shared/lib';

export function PaymentPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  // Fetch data
  const { data: session, isLoading: sessionLoading, error: sessionError } = useSession(sessionId!);
  const { user, isLoading: userLoading } = useCurrentUserProfile();
  const { data: cashbackWallet, isLoading: cashbackLoading } = useCurrentUserCashback();
  const { data: plansData, isLoading: plansLoading, error: plansError } = useSeasonTicketPlans();

  const seasonTicketPlans = useMemo(() => {
    if (!session || plansLoading || !plansData) {
      return null;
    }

    return plansData.items.filter((plan) => plan.description === getSessionType(session))
  }, [plansData, plansLoading, session])

  // const seasonTicketPlans = plansData?.items?.filter((plan) => plan) || [];
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


  useEffect(() => {
    if (product === 'subscription' && seasonTicketPlans && seasonTicketPlans.length === 0) {
      updateProduct('single_session');
    }

  }, [product, seasonTicketPlans])

  // Auto-select first plan
  useInitialPlanSelection(seasonTicketPlans ?? [], selectedPlanId, updateSelectedPlan);

  // Payment processing hook
  const { processPayment, isProcessing } = usePaymentProcessing(
    session || null,
    user || null
  );

  // Calculate prices
  const selectedPlan = seasonTicketPlans?.find((plan) => plan.id === selectedPlanId);
  const subscriptionPrice = selectedPlan?.price.amountMinor || 0;
  const sessionPrice = session?.event?.tickets?.[0]?.full.price.amountMinor || 0;
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

   // Configure tabs with content - FULLY CONFIGURABLE!
  const tabs = useMemo(() => {
    const res: TabConfig<ProductType>[] = []; 

    if (seasonTicketPlans &&seasonTicketPlans.length > 0) {
      res.push({
        id: 'subscription',
        label: 'Абонемент',
        content: (
          <>
            {selectedPlan && (<PriceBreakdown
              productName={`Абонемент ${selectedPlan.passes} ${pluralize(selectedPlan.passes, ['занятие', 'занятия', 'занятий'])}`}
              description={selectedPlan.description ?? undefined}
              price={selectedPlan.price}
            />)}
            <SeasonTicketPlans
              plans={seasonTicketPlans}
              selectedPlanId={selectedPlanId}
              onPlanSelect={updateSelectedPlan}
            />
          </>
        ),
      });
    }

    res.push({
      id: 'single_session',
      label: 'Разовая тренировка',
      content: (
        session && <PriceBreakdown
          productName={session.event.title}
          description={getSessionType(session)}
          price={session.event.tickets[0]?.full.price}
        />
      ),
    });

    return res;

  }, [selectedPlan, session, seasonTicketPlans, selectedPlanId, updateSelectedPlan]);

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
