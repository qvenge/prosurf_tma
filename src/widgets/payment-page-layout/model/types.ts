import type { ReactNode } from 'react';

/**
 * Configuration for a single tab - FULLY CONFIGURABLE
 */
export interface TabConfig<T extends string = string> {
  /** Unique identifier for the tab */
  id: T;
  /** Display label for the tab */
  label: string;
  /** Content to render when this tab is active - ANY React content */
  content: ReactNode;
}

/**
 * Configuration for cashback payment option
 */
export interface CashbackConfig {
  /** Whether cashback option is enabled */
  enabled: boolean;

  total: number;
  /** Available cashback value in minor units */
  value: number;
  /** Whether cashback is currently active/selected */
  active: boolean;
  /** Callback when cashback toggle changes */
  onChange: (active: boolean) => void;
}

/**
 * Configuration for certificate payment option
 */
export interface CertificateConfig {
  /** Whether certificate option is enabled */
  enabled: boolean;
  /** Certificate value in minor units */
  value: number;
  /** Whether certificate is currently active/selected */
  active: boolean;
  /** Callback when certificate toggle changes */
  onChange: (active: boolean) => void;
}

/**
 * Payment options configuration - keeps PaymentOptions in widget but configurable
 */
export interface PaymentOptionsConfig {
  /** Cashback configuration */
  cashback?: CashbackConfig;
  /** Certificate configuration */
  certificate?: CertificateConfig;
}

/**
 * Payment summary configuration
 */
export interface PaymentSummaryConfig {
  /** Original price before discounts */
  originalPrice: number;
  /** Final price after discounts */
  finalPrice: number;
  /** Callback when payment button is clicked */
  onPayment: () => void;
  /** Whether payment is processing */
  isProcessing: boolean;
  /** Payment error message */
  error?: string | null;
}

/**
 * Props for the PaymentPageLayout component - FULLY CONFIGURABLE
 */
export interface PaymentPageLayoutProps<T extends string = string> {
  /** Tab configuration - fully customizable */
  tabs: TabConfig<T>[];
  /** Currently active tab ID */
  activeTab: T;
  /** Callback when tab changes */
  onTabChange: (tabId: T) => void;

  /** Payment options configuration (integrated in widget, but configurable) */
  paymentOptions?: PaymentOptionsConfig;

  /** Payment summary configuration (required) */
  summary: PaymentSummaryConfig;

  /** Optional content to render before tabs */
  topContent?: ReactNode;

  /** Whether data is loading */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Optional className for wrapper */
  className?: string;
}

// Legacy types - keep for backward compatibility with hooks
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
