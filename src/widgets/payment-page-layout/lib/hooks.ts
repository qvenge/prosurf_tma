import { useState, useEffect } from 'react';
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
