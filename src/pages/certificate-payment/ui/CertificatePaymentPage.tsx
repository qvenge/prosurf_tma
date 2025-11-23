import { useMemo, useState } from 'react';
import { PageLayout } from '@/widgets/page-layout';
import {
  PaymentPageLayout,
  type TabConfig,
  type PaymentSummaryConfig,
} from '@/widgets/payment-page-layout';
import { DenominationOptions } from './components/DenominationOptions';
import { SingleTrainingOption } from './components/SingleTrainingOption';
import { useCertificatePayment } from '../lib/hooks';
import { SINGLE_TRAINING_PRICE_MINOR, MIN_DENOMINATION } from '../lib/constants';
import type { CertificateType } from '@/shared/api';
import styles from './CertificatePaymentPage.module.scss';

type ProductType = CertificateType; // 'denomination' | 'passes'

export function CertificatePaymentPage() {
  // State management
  const [activeTab, setActiveTab] = useState<ProductType>('denomination');
  const [denominationAmount, setDenominationAmount] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState('');

  // Payment processing hook
  const { processPayment, isProcessing } = useCertificatePayment();

  // Calculate price based on selected product type
  const priceInMinor = useMemo(() => {
    if (activeTab === 'passes') {
      return SINGLE_TRAINING_PRICE_MINOR;
    }
    // For denomination, convert rubles to kopecks
    return denominationAmount ? denominationAmount * 100 : 0;
  }, [activeTab, denominationAmount]);

  // Handler for payment
  const handlePayment = () => {
    const amount = activeTab === 'denomination' ? denominationAmount : null;
    processPayment(activeTab, amount, setPaymentError);
  };

  // Check if payment button should be disabled
  const isPaymentDisabled = useMemo(() => {
    if (isProcessing) return true;

    if (activeTab === 'denomination') {
      return !denominationAmount || denominationAmount < MIN_DENOMINATION;
    }

    // For passes type, always enabled
    return false;
  }, [activeTab, denominationAmount, isProcessing]);

  // Configure tabs
  const tabs = useMemo<TabConfig<ProductType>[]>(() => {
    return [
      {
        id: 'denomination',
        label: 'Номинал',
        content: (
          <div className={styles.tabContent}>
            <DenominationOptions
              selectedAmount={denominationAmount}
              onAmountChange={setDenominationAmount}
              minAmount={MIN_DENOMINATION}
            />
          </div>
        ),
      },
      {
        id: 'passes',
        label: 'Разовая тренировка',
        content: (
          <div className={styles.tabContent}>
            <SingleTrainingOption />
          </div>
        ),
      },
    ];
  }, [denominationAmount]);

  // Payment summary configuration
  const summary: PaymentSummaryConfig = {
    originalPrice: priceInMinor,
    finalPrice: priceInMinor,
    onPayment: handlePayment,
    isProcessing: isProcessing || isPaymentDisabled,
    error: paymentError,
  };

  return (
    <PageLayout title="Покупка сертификата">
      <PaymentPageLayout
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        summary={summary}
      />
    </PageLayout>
  );
}
