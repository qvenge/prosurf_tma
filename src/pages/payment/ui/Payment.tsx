import { useEffect, useMemo, useState } from 'react';
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
  useSeasonTicketPlans,
  type SeasonTicketPlan
} from '@/shared/api';
import { usePaymentProcessing } from '../lib/hooks';
import { ERROR_MESSAGES } from '../lib/constants';
import { LoadingState, ErrorState } from './components';
import { PriceBreakdown, SeasonTicketPlans, SelectedPlanDisplay } from '@/widgets/payment-page-layout';
import { pluralize, getSessionType } from '@/shared/lib';

type PaymentContext = 'session' | 'season-ticket';

export function PaymentPage() {
  const { sessionId, planId } = useParams<{ sessionId?: string; planId?: string }>();

  // Determine context based on route params
  const context: PaymentContext = sessionId ? 'session' : 'season-ticket';

  // Conditional data fetching based on context
  const sessionQuery = useSession(sessionId || '');
  const { data: session, isLoading: sessionLoading, error: sessionError } = context === 'session'
    ? sessionQuery
    : { data: undefined, isLoading: false, error: null };
  const { user, isLoading: userLoading } = useCurrentUserProfile();
  const { data: cashbackWallet, isLoading: cashbackLoading } = useCurrentUserCashback();
  const { data: plansData, isLoading: plansLoading, error: plansError } = useSeasonTicketPlans();

  const cashbackValue = cashbackWallet?.balance.amountMinor || 0;

  // State management - different approaches for different contexts
  const sessionPaymentState = usePaymentState();
  const [seasonTicketState, setSeasonTicketState] = useState({
    selectedPlanId: '',
    activeCashback: false,
    paymentError: '',
  });

  // Select appropriate state based on context
  const {
    product,
    selectedPlanId,
    activeCashback,
    paymentError,
    updateProduct,
    updateSelectedPlan,
    updateActiveCashback,
    setPaymentError,
  } = context === 'session'
    ? sessionPaymentState
    : {
        product: 'subscription' as ProductType,
        selectedPlanId: seasonTicketState.selectedPlanId,
        activeCashback: seasonTicketState.activeCashback,
        paymentError: seasonTicketState.paymentError,
        updateProduct: () => {},
        updateSelectedPlan: (id: string) => setSeasonTicketState(s => ({ ...s, selectedPlanId: id })),
        updateActiveCashback: (active: boolean) => setSeasonTicketState(s => ({ ...s, activeCashback: active })),
        setPaymentError: (error: string) => setSeasonTicketState(s => ({ ...s, paymentError: error })),
      };

  // Calculate available plans based on context
  const availablePlans = useMemo<SeasonTicketPlan[] | null>(() => {
    if (plansLoading || !plansData) {
      return null;
    }

    if (context === 'session') {
      // For session payment: filter by session type
      if (!session) return null;
      return plansData.items.filter((plan) => plan.description === getSessionType(session));
    } else {
      // For standalone season ticket: filter by selected plan's description
      if (!selectedPlanId) {
        return plansData.items;
      }
      const selected = plansData.items.find(plan => plan.id === selectedPlanId);
      return selected
        ? plansData.items.filter(plan => plan.description === selected.description)
        : plansData.items;
    }
  }, [plansData, plansLoading, session, context, selectedPlanId]);

  // Auto-select first plan on mount for season ticket context
  useEffect(() => {
    if (context === 'season-ticket' && plansData?.items && !seasonTicketState.selectedPlanId) {
      const initialPlanId = planId ?? plansData.items[0]?.id;
      if (initialPlanId) {
        setSeasonTicketState(s => ({ ...s, selectedPlanId: initialPlanId }));
      }
    }
  }, [context, plansData, seasonTicketState.selectedPlanId, planId]);

  // Auto-select first plan for session context
  useInitialPlanSelection(
    context === 'session' ? (availablePlans ?? []) : [],
    context === 'session' ? selectedPlanId : '',
    context === 'session' ? updateSelectedPlan : () => {}
  );

  // Auto-switch to single session if no subscription plans available
  useEffect(() => {
    if (context === 'session' && product === 'subscription' && availablePlans && availablePlans.length === 0) {
      updateProduct('single_session');
    }
  }, [context, product, availablePlans, updateProduct]);

  // Payment processing hook
  const { processSessionPayment, processSeasonTicketPayment, isProcessing } = usePaymentProcessing(
    context === 'session' ? (session || null) : null,
    context === 'session' ? (user || null) : null
  );

  // Calculate prices
  const selectedPlan = availablePlans?.find((plan) => plan.id === selectedPlanId);
  const subscriptionPrice = selectedPlan?.price.amountMinor || 0;
  const sessionPrice = session?.event?.tickets?.[0]?.full.price.amountMinor || 0;

  const originalPrice = context === 'season-ticket'
    ? subscriptionPrice
    : (product === 'subscription' ? subscriptionPrice : sessionPrice);

  const { finalPrice, cashbackAmount } = calculatePrices(originalPrice, cashbackValue, activeCashback);

  // Handler for payment
  const handlePayment = () => {
    if (context === 'session') {
      // Session payment with all params
      processSessionPayment(
        selectedPlanId,
        product,
        activeCashback,
        activeCashback ? cashbackAmount : 0,
        cashbackWallet?.balance.currency || 'RUB',
        setPaymentError
      );
    } else {
      // Season ticket payment with reduced params
      processSeasonTicketPayment(
        selectedPlanId,
        activeCashback,
        activeCashback ? cashbackAmount : 0,
        setPaymentError
      );
    }
  };

  // Combined loading state
  const isLoading = context === 'session'
    ? sessionLoading || userLoading || cashbackLoading || plansLoading
    : cashbackLoading || plansLoading;

  // Configure tabs based on context
  const tabs = useMemo(() => {
    if (context === 'season-ticket') {
      // Single tab for season ticket purchase
      return [{
        id: 'subscription' as const,
        label: 'Абонемент',
        content: (
          <>
            {selectedPlan && <SelectedPlanDisplay data={selectedPlan} />}
            {availablePlans && (
              <SeasonTicketPlans
                plans={availablePlans}
                selectedPlanId={selectedPlanId}
                onPlanSelect={updateSelectedPlan}
              />
            )}
          </>
        ),
      }];
    }

    // Session payment: show subscription tab if plans available, always show single session
    const res: TabConfig<ProductType>[] = [];

    if (availablePlans && availablePlans.length > 0) {
      res.push({
        id: 'subscription',
        label: 'Абонемент',
        content: (
          <>
            {selectedPlan && (
              <PriceBreakdown
                productName={`Абонемент ${selectedPlan.passes} ${pluralize(selectedPlan.passes, ['занятие', 'занятия', 'занятий'])}`}
                description={selectedPlan.description ?? undefined}
                price={selectedPlan.price}
              />
            )}
            <SeasonTicketPlans
              plans={availablePlans}
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
        session && (
          <PriceBreakdown
            productName={session.event.title}
            description={getSessionType(session)}
            price={session.event.tickets[0]?.full.price}
          />
        )
      ),
    });

    return res;
  }, [context, selectedPlan, session, availablePlans, selectedPlanId, updateSelectedPlan]);

  // Error state
  if ((context === 'session' && sessionError) || plansError) {
    return (
      <PageLayout title={context === 'season-ticket' ? 'Покупка абонемента' : 'Оплата'}>
        <ErrorState message={ERROR_MESSAGES.DATA_LOADING_ERROR} />
      </PageLayout>
    );
  }

  // Context-specific validation errors
  if (!isLoading) {
    if (context === 'session' && !session) {
      return (
        <PageLayout title="Оплата">
          <ErrorState message={ERROR_MESSAGES.SESSION_NOT_FOUND} />
        </PageLayout>
      );
    }

    if (context === 'season-ticket' && (!availablePlans || availablePlans.length === 0)) {
      return (
        <PageLayout title="Покупка абонемента">
          <ErrorState message={ERROR_MESSAGES.NO_PLANS_AVAILABLE} />
        </PageLayout>
      );
    }
  }

  // Show loading
  if (isLoading || (context === 'session' && !session)) {
    return (
      <PageLayout title={context === 'season-ticket' ? 'Покупка абонемента' : 'Оплата'}>
        <LoadingState />
      </PageLayout>
    );
  }

  // Payment options configuration
  const paymentOptions: PaymentOptionsConfig = {
    cashback: {
      enabled: cashbackAmount > 0,
      total: cashbackValue,
      value: cashbackAmount,
      active: activeCashback,
      onChange: updateActiveCashback,
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
  };

  return (
    <PageLayout title="Оплата">
      <PaymentPageLayout
        tabs={tabs}
        activeTab={context === 'season-ticket' ? 'subscription' : product}
        onTabChange={context === 'season-ticket' ? () => {} : updateProduct}
        paymentOptions={paymentOptions}
        summary={summary}
      />
    </PageLayout>
  );
}
