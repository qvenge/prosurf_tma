import { Button } from '@/shared/ui';
import { formatPrice, calculateCashback } from '../../../lib/helpers';
import { PAYMENT_CONSTANTS } from '../../../lib/constants';
import type { PaymentSummaryConfig } from '../../../model/types';
import styles from './PaymentSummary.module.scss';

interface PaymentSummaryProps {
  summary: PaymentSummaryConfig;
}

export function PaymentSummary({ summary }: PaymentSummaryProps) {
  const { originalPrice, finalPrice, onPayment, isProcessing, error } = summary;

  const hasDiscount = originalPrice !== finalPrice;
  const earnedCashback = calculateCashback(finalPrice);

  return (
    <div className={styles.footer}>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.footerTitle}>Итого</div>

      <div className={styles.totalPriceWrapper}>
        {hasDiscount && (
          <div className={styles.initialPrice}>
            {formatPrice(originalPrice)} {PAYMENT_CONSTANTS.CURRENCY}
          </div>
        )}
        <div className={styles.totalPrice}>
          {formatPrice(finalPrice)} {PAYMENT_CONSTANTS.CURRENCY}
        </div>
      </div>

      <Button
        className={styles.payButton}
        size='l'
        stretched={true}
        mode='primary'
        onClick={onPayment}
        disabled={isProcessing}
      >
        {isProcessing ? 'Обработка...' : 'Оплатить'}
      </Button>

      <div className={styles.cashback}>
        {`Начислим кэшбек: ${formatPrice(earnedCashback)} ${PAYMENT_CONSTANTS.CURRENCY}`}
      </div>
    </div>
  );
}