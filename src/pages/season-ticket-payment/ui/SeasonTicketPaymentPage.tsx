import { useMemo } from 'react';
import { useParams } from 'react-router';
import { PageLayout } from '@/widgets/page-layout';
import {
  PaymentPageLayout,
  calculatePrices,
  type TabConfig,
  type PaymentOptionsConfig,
  type PaymentSummaryConfig,
} from '@/widgets/payment-page-layout';
import {
  useCurrentUserCashback,
  useSeasonTicketPlans,
  type SeasonTicketPlan
} from '@/shared/api';
import { usePaymentProcessing } from '../lib/hooks';
import { ERROR_MESSAGES } from '../lib/constants';
import { LoadingState, ErrorState } from './components';
import { useState } from 'react';
import { SelectedPlanDisplay, SeasonTicketPlans } from '@/widgets/payment-page-layout';

type SeasonTicketTab = 'season_ticket';

export function SeasonTicketPaymentPage() {
  const { planId } = useParams<{ planId: string }>();
  // Fetch data
  const { data: cashbackWallet, isLoading: cashbackLoading } = useCurrentUserCashback();
  const { data: plansData, isLoading: plansLoading, error: plansError } = useSeasonTicketPlans();

  // const subscriptionPlans = plansData?.items || [];
  const cashbackValue = cashbackWallet?.balance.amountMinor || 0;

  // Local state for plan selection and payment options
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [plans, setPlans] = useState<SeasonTicketPlan[] | null>(null);
  const [activeCashback, setActiveCashback] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Auto-select first plan when plans load
  useMemo(() => {
    if (plansData?.items && plansData.items.length > 0 && !selectedPlanId) {
      setSelectedPlanId(planId ?? plansData.items[0].id);
    }
  }, [plansData, selectedPlanId, planId]);

  useMemo(() => {
    if (selectedPlanId && plansData?.items) {
      const selected = plansData.items.find(plan => plan.id === selectedPlanId);
      setPlans(selected ? plansData.items.filter(plan => plan.description === selected.description) : plansData.items);
    }
  }, [plansData, selectedPlanId]);

  // Payment processing hook
  const { processPayment, isProcessing } = usePaymentProcessing();

  // Calculate prices
  const selectedPlan = plans?.find((plan) => plan.id === selectedPlanId);
  const subscriptionPrice = selectedPlan?.price.amountMinor || 0;
  const { finalPrice } = calculatePrices(subscriptionPrice, cashbackValue, activeCashback);

  // Handler for payment
  const handlePayment = () => {
    processPayment(
      selectedPlanId,
      activeCashback,
      activeCashback ? cashbackValue : 0,
      setPaymentError
    );
  };

  // Combined loading state
  const isLoading = cashbackLoading || plansLoading;

    // Configure single tab for season ticket purchase
  const tabs: TabConfig<SeasonTicketTab>[] = useMemo(() => [
    {
      id: 'season_ticket',
      label: 'Абонемент',
      content: (
        <>
          {selectedPlan && <SelectedPlanDisplay
            data={selectedPlan}
          />}
          {plans && <SeasonTicketPlans
            plans={plans}
            selectedPlanId={selectedPlanId}
            onPlanSelect={setSelectedPlanId}
          />}
        </>
      ),
    },
  ], [plans, selectedPlanId, selectedPlan]);

  // Error state
  if (plansError) {
    return (
      <PageLayout title="Покупка абонемента">
        <ErrorState message={ERROR_MESSAGES.DATA_LOADING_ERROR} />
      </PageLayout>
    );
  }

  // Show loading until we have plans data
  if (isLoading) {
    return (
      <PageLayout title="Покупка абонемента">
        <LoadingState />
      </PageLayout>
    );
  }

  // No plans available
  if (!plans || plans.length === 0) {
    return (
      <PageLayout title="Покупка абонемента">
        <ErrorState message={ERROR_MESSAGES.NO_PLANS_AVAILABLE} />
      </PageLayout>
    );
  }

  // Payment options configuration
  const paymentOptions: PaymentOptionsConfig = {
    cashback: {
      enabled: cashbackValue > 0,
      value: cashbackValue,
      active: activeCashback,
      onChange: setActiveCashback,
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
    originalPrice: subscriptionPrice,
    finalPrice,
    onPayment: handlePayment,
    isProcessing,
    error: paymentError,
  };

  return (
    <PageLayout title="Оплата">
      <PaymentPageLayout
        tabs={tabs}
        activeTab="season_ticket"
        onTabChange={() => {}}
        paymentOptions={paymentOptions}
        summary={summary}
      />
    </PageLayout>
  );
}
