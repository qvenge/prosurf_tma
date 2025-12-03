import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { PageLayout } from '@/widgets/page-layout';
import {
  PaymentPageLayout,
  usePaymentState,
  useInitialPlanSelection,
  calculatePrices,
  PriceBreakdown,
  SeasonTicketPlans,
  type TabConfig,
  type ProductType,
  type PaymentOptionsConfig,
  type PaymentSummaryConfig,
} from '@/widgets/payment-page-layout';
import {
  useSession,
  useCurrentClient,
  useMyBonus,
  useSeasonTicketPlans,
  useBonusRules,
  type SeasonTicketPlan,
} from '@/shared/api';
import { useSessionPayment } from '../lib/hooks';
import { SESSION_PAYMENT_ERRORS } from '../lib/constants';
import {
  LoadingState,
  ErrorState,
  PlansErrorState,
  BonusErrorState,
} from '@/shared/ui/payment-states';
import { pluralize, getSessionType } from '@/shared/lib';

export function SessionPaymentPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  // Data fetching
  const { data: session, isLoading: sessionLoading, error: sessionError } = useSession(sessionId || '');
  const { user, isLoading: userLoading } = useCurrentClient();
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
    if (sessionError) {
      console.error('Session payment page - Session loading error:', sessionError);
    }
    if (bonusError) {
      console.error('Session payment page - Bonus loading error:', bonusError);
    }
    if (plansError) {
      console.error('Session payment page - Plans loading error:', plansError);
    }
  }, [sessionError, bonusError, plansError]);

  const bonusValue = bonusWallet?.balance || 0;

  // State management
  const {
    product,
    selectedPlanId,
    activeBonus,
    paymentError,
    updateProduct,
    updateSelectedPlan,
    updateActiveBonus,
    setPaymentError,
  } = usePaymentState();

  // Calculate available plans - filter by session type
  const availablePlans = useMemo<SeasonTicketPlan[] | null>(() => {
    // Return null only if loading OR if there's no data AND no error (initial state)
    if (plansLoading || (!plansData && !plansError)) {
      return null;
    }

    // If there's an error or no data, return empty array (graceful degradation)
    if (plansError || !plansData) {
      return [];
    }

    // Filter by session type
    if (!session) return null;
    return plansData.items.filter((plan) => plan.description === getSessionType(session));
  }, [plansData, plansLoading, plansError, session]);

  // Auto-select first plan
  useInitialPlanSelection(availablePlans ?? [], selectedPlanId, updateSelectedPlan);

  // Payment processing hook
  const { processPayment, isProcessing } = useSessionPayment(session || null, user || null);

  // Check if subscription tab should be shown
  const hasSubscriptionTab = plansError || (availablePlans && availablePlans.length > 0);

  // Reset to single_session when subscription tab is hidden
  useEffect(() => {
    if (!hasSubscriptionTab && product === 'subscription') {
      updateProduct('single_session');
    }
  }, [hasSubscriptionTab, product, updateProduct]);

  // Calculate prices
  const selectedPlan = availablePlans?.find((plan) => plan.id === selectedPlanId);
  const subscriptionPrice = selectedPlan?.price.amountMinor || 0;
  const sessionPrice = session?.event?.tickets?.[0]?.full.price.amountMinor || 0;

  const originalPrice = product === 'subscription' ? subscriptionPrice : sessionPrice;

  // Get max redeem rate based on product type
  const maxRedeemRate = product === 'subscription'
    ? (bonusRules?.maxRedeemRates?.seasonTicket ?? 0)
    : (bonusRules?.maxRedeemRates?.single ?? 0);

  const { finalPrice, bonusAmount } = calculatePrices(originalPrice, bonusValue, activeBonus, maxRedeemRate);

  // Get bonus rate (same rate for all product types)
  const bonusRate = bonusRules?.earnRate ?? 0;

  // Handler for payment
  const handlePayment = () => {
    processPayment(
      selectedPlanId,
      product,
      activeBonus,
      activeBonus ? bonusAmount : 0,
      setPaymentError
    );
  };

  // Combined loading state
  const isLoading = sessionLoading || userLoading || bonusLoading || plansLoading;

  // Configure tabs
  const tabs = useMemo<TabConfig<ProductType>[]>(() => {
    const result: TabConfig<ProductType>[] = [];

    // Single session tab
    result.push({
      id: 'single_session',
      label: 'Разовая тренировка',
      content: session && (
        <PriceBreakdown
          productName={session.event.title}
          description={getSessionType(session)}
          price={session.event.tickets[0]?.full.price}
        />
      ),
    });

    // Subscription tab - only show if plans are available or there's an error (to allow retry)
    if (hasSubscriptionTab) {
      result.push({
        id: 'subscription',
        label: 'Абонемент',
        content: (
          <>
            {plansError ? (
              // Show error state with retry button
              <PlansErrorState onRetry={() => refetchPlans()} />
            ) : (
              <>
                {selectedPlan && (
                  <PriceBreakdown
                    productName={`Абонемент ${selectedPlan.passes} ${pluralize(selectedPlan.passes, ['занятие', 'занятия', 'занятий'])}`}
                    description={selectedPlan.description ?? undefined}
                    price={selectedPlan.price}
                  />
                )}
                <SeasonTicketPlans
                  plans={availablePlans ?? []}
                  selectedPlanId={selectedPlanId}
                  onPlanSelect={updateSelectedPlan}
                />
              </>
            )}
          </>
        ),
      });
    }

    return result;
  }, [selectedPlan, session, availablePlans, selectedPlanId, updateSelectedPlan, plansError, refetchPlans, hasSubscriptionTab]);

  // Error state - session error
  if (sessionError) {
    return (
      <PageLayout title="Оплата">
        <ErrorState message={SESSION_PAYMENT_ERRORS.DATA_LOADING_ERROR} />
      </PageLayout>
    );
  }

  // Session not found
  if (!isLoading && !session) {
    return (
      <PageLayout title="Оплата">
        <ErrorState message={SESSION_PAYMENT_ERRORS.SESSION_NOT_FOUND} />
      </PageLayout>
    );
  }

  // Show loading
  if (isLoading || !session) {
    return (
      <PageLayout title="Оплата">
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
          onChange: updateActiveBonus,
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
    originalPrice,
    finalPrice,
    onPayment: handlePayment,
    isProcessing,
    error: paymentError,
    bonusRate,
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
