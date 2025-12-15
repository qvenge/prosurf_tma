import { useMemo, useState } from 'react';
import { PageLayout } from '@/widgets/page-layout';
import {
  PaymentPageLayout,
  PriceBreakdown,
  type TabConfig,
  type PaymentSummaryConfig,
} from '@/widgets/payment-page-layout';
import { Spinner } from '@/shared/ui';
import { DenominationOptions } from './components/DenominationOptions';
import { useCertificatePayment } from '../lib/hooks';
import { useCertificateProducts } from '@/shared/api/hooks/certificates';
import { MIN_DENOMINATION } from '@/shared/lib/constants';
import type { CertificateType } from '@/shared/api';
import styles from './CertificatePaymentPage.module.scss';

type ProductType = CertificateType; // 'denomination' | 'passes'

export function CertificatePaymentPage() {
  // State management
  const [activeTab, setActiveTab] = useState<ProductType>('passes');
  const [denominationAmount, setDenominationAmount] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState('');

  // Fetch certificate products from API
  const { data: productsData, isLoading: isLoadingProducts } = useCertificateProducts();

  // Extract product data from API response
  const passesProduct = productsData?.items.find(item => item.type === 'passes');
  const denominationProduct = productsData?.items.find(item => item.type === 'denomination');

  // Get prices from API (with fallbacks)
  const passesPriceMinor = passesProduct?.price?.amountMinor ?? 0;
  const minDenominationAmount = denominationProduct?.minAmount
    ? Math.round(denominationProduct.minAmount.amountMinor / 100)
    : MIN_DENOMINATION;

  // Payment processing hook
  const { processPayment, isProcessing } = useCertificatePayment();

  // Calculate price based on selected product type
  const priceInMinor = useMemo(() => {
    if (activeTab === 'passes') {
      return passesPriceMinor;
    }
    // For denomination, convert rubles to kopecks
    return denominationAmount ? denominationAmount * 100 : 0;
  }, [activeTab, denominationAmount, passesPriceMinor]);

  // Handler for payment
  const handlePayment = () => {
    const amount = activeTab === 'denomination' ? denominationAmount : null;
    processPayment(activeTab, amount, setPaymentError, passesPriceMinor, minDenominationAmount);
  };

  // Check if payment button should be disabled
  const isPaymentDisabled = useMemo(() => {
    if (isProcessing || isLoadingProducts) return true;

    if (activeTab === 'denomination') {
      return !denominationAmount || denominationAmount < minDenominationAmount;
    }

    // For passes type, disabled if no price from API
    return !passesPriceMinor;
  }, [activeTab, denominationAmount, isProcessing, isLoadingProducts, minDenominationAmount, passesPriceMinor]);

  // Configure tabs
  const tabs = useMemo<TabConfig<ProductType>[]>(() => {
    return [
      {
        id: 'passes',
        label: 'Разовая тренировка',
        content: (
          <div className={styles.tabContent}>
            {isLoadingProducts ? (
              <div className={styles.loading}>
                <Spinner size="m" />
              </div>
            ) : (
              <PriceBreakdown
                productName="Сертификат"
                description="Разовая тренировка по серфингу"
                price={{ amountMinor: passesPriceMinor, currency: 'RUB' }}
              />
            )}
          </div>
        ),
      },
      {
        id: 'denomination',
        label: 'Номинал',
        content: (
          <div className={styles.tabContent}>
            <PriceBreakdown
              productName="Сертификат"
              description="Номинал"
              price={{ amountMinor: denominationAmount ? denominationAmount * 100 : 0, currency: 'RUB' }}
            />
            <DenominationOptions
              selectedAmount={denominationAmount}
              onAmountChange={setDenominationAmount}
              minAmount={minDenominationAmount}
            />
          </div>
        ),
      }
    ];
  }, [denominationAmount, passesPriceMinor, minDenominationAmount, isLoadingProducts, passesProduct?.description, denominationProduct?.description]);

  // Payment summary configuration
  const summary: PaymentSummaryConfig = {
    originalPrice: priceInMinor,
    finalPrice: priceInMinor,
    onPayment: handlePayment,
    isProcessing: isProcessing || isPaymentDisabled,
    error: paymentError,
  };

  return (
    <PageLayout title="Оплата">
      <PaymentPageLayout
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        summary={summary}
      />
    </PageLayout>
  );
}
