export type ProductType = 'subscription' | 'single_session';

export type EventType = 'surfingTraining' | 'surfskateTraining' | 'tour' | 'other';

export interface PaymentState {
  product: ProductType;
  selectedPlanId: string;
  activeCashback: boolean;
  paymentError: string | null;
}

export interface PriceCalculation {
  originalPrice: number;
  finalPrice: number;
  cashbackAmount: number;
  earnedCashback: number;
}