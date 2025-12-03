import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { PageLayout } from '@/widgets/page-layout';
import {
  PaymentPageLayout,
  calculatePrices,
  SeasonTicketPlans,
  SelectedPlanDisplay,
  type TabConfig,
  type ProductType,
  type PaymentOptionsConfig,
  type PaymentSummaryConfig,
} from '@/widgets/payment-page-layout';
import { useMyBonus, useSeasonTicketPlans, useBonusRules, type SeasonTicketPlan } from '@/shared/api';
import { useSeasonTicketPayment } from '../lib/hooks';
import { LoadingState, PlansErrorState, BonusErrorState } from '@/shared/ui/payment-states';

export function SeasonTicketPaymentPage() {
  const { planId } = useParams<{ planId?: string }>();

  // Data fetching
  const { data: bonusWallet, isLoading: bonusLoading, error: bonusError } = useMyBonus();
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useSeasonTicketPlans();
  const { data: bonusRules } = useBonusRules();

  // Log errors for debugging
  useEffect(() => {
    if (bonusError) {
      console.error('Season ticket payment page - Bonus loading error:', bonusError);
    }
    if (plansError) {
      console.error('Season ticket payment page - Plans loading error:', plansError);
    }
  }, [bonusError, plansError]);

  const bonusValue = bonusWallet?.balance || 0;

  // State management
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [activeBonus, setActiveBonus] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Auto-select plan from route param or first available
  useEffect(() => {
    if (plansData?.items && !selectedPlanId) {
      const initialPlanId = planId ?? plansData.items[0]?.id;
      if (initialPlanId) {
        setSelectedPlanId(initialPlanId);
      }
    }
  }, [plansData, selectedPlanId, planId]);

  // Calculate available plans - filter by selected plan's description
  const availablePlans = useMemo<SeasonTicketPlan[] | null>(() => {
    // Return null only if loading OR if there's no data AND no error (initial state)
    if (plansLoading || (!plansData && !plansError)) {
      return null;
    }

    // If there's an error or no data, return empty array (graceful degradation)
    if (plansError || !plansData) {
      return [];
    }

    // For standalone season ticket: filter by selected plan's description
    if (!selectedPlanId) {
      return plansData.items;
    }
    const selected = plansData.items.find((plan) => plan.id === selectedPlanId);
    return selected
      ? plansData.items.filter((plan) => plan.description === selected.description)
      : plansData.items;
  }, [plansData, plansLoading, plansError, selectedPlanId]);

  // Payment processing hook
  const { processPayment, isProcessing } = useSeasonTicketPayment();

  // Calculate prices
  const selectedPlan = availablePlans?.find((plan) => plan.id === selectedPlanId);
  const subscriptionPrice = selectedPlan?.price.amountMinor || 0;

  const { finalPrice, bonusAmount } = calculatePrices(subscriptionPrice, bonusValue, activeBonus);

  // Get bonus rate for season tickets
  const bonusRate = useMemo(() => {
    if (!bonusRules?.earnRates) return 0;
    const rule = bonusRules.earnRates.find((r) => r.product === 'seasonTicket');
    return rule?.rate ?? 0;
  }, [bonusRules]);

  // Handler for payment
  const handlePayment = () => {
    processPayment(
      selectedPlanId,
      activeBonus,
      activeBonus ? bonusAmount : 0,
      setPaymentError
    );
  };

  // Combined loading state
  const isLoading = bonusLoading || plansLoading;

  // Configure tabs - single tab for subscription
  const tabs = useMemo<TabConfig<ProductType>[]>(() => {
    return [
      {
        id: 'subscription',
        label: 'Абонемент',
        content: (
          <>
            {plansError ? (
              // Show error state with retry button
              <PlansErrorState onRetry={() => refetchPlans()} />
            ) : (
              <>
                {selectedPlan && <SelectedPlanDisplay data={selectedPlan} />}
                {availablePlans && (
                  <SeasonTicketPlans
                    plans={availablePlans}
                    selectedPlanId={selectedPlanId}
                    onPlanSelect={setSelectedPlanId}
                  />
                )}
              </>
            )}
          </>
        ),
      },
    ];
  }, [selectedPlan, availablePlans, selectedPlanId, plansError, refetchPlans]);

  // Show loading
  if (isLoading) {
    return (
      <PageLayout title="Покупка абонемента">
        <LoadingState />
      </PageLayout>
    );
  }

  // Payment options configuration
  const paymentOptions: PaymentOptionsConfig = {
    bonus: bonusError
      ? {
          // Show error state for bonus
          enabled: false,
          total: 0,
          value: 0,
          active: false,
          onChange: () => {},
          errorComponent: <BonusErrorState />,
        }
      : {
          enabled: bonusAmount > 0,
          total: bonusValue,
          value: bonusAmount,
          active: activeBonus,
          onChange: setActiveBonus,
        },
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
    bonusRate,
  };

  return (
    <PageLayout title="Покупка абонемента">
      <PaymentPageLayout
        tabs={tabs}
        activeTab="subscription"
        onTabChange={() => {}}
        paymentOptions={paymentOptions}
        summary={summary}
      />
    </PageLayout>
  );
}
