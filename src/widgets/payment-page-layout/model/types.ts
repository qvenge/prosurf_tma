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
 * Configuration for bonus payment option
 */
export interface BonusConfig {
  /** Whether bonus option is enabled */
  enabled: boolean;

  total: number;
  /** Available bonus value in minor units */
  value: number;
  /** Whether bonus is currently active/selected */
  active: boolean;
  /** Callback when bonus toggle changes */
  onChange: (active: boolean) => void;
  /** Optional error component to display instead of normal bonus UI */
  errorComponent?: ReactNode;
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
  /** Bonus configuration */
  bonus?: BonusConfig;
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
  /** Bonus rate (0-1). If undefined or 0, bonus info is hidden */
  bonusRate?: number;
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
  activeBonus: boolean;
  paymentError: string | null;
}

export interface PriceCalculation {
  originalPrice: number;
  finalPrice: number;
  bonusAmount: number;
}
