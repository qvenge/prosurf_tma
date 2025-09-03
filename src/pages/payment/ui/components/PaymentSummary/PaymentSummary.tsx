import { Button } from '@/shared/ui';
import { formatPrice, calculateCashback } from '../../../lib/helpers';
import { PAYMENT_CONSTANTS } from '../../../lib/constants';
import styles from './PaymentSummary.module.scss';

interface PaymentSummaryProps {
  originalPrice: number;
  finalPrice: number;
  isProcessing: boolean;
  onPaymentClick: () => void;
  paymentError?: string | null;
}

export function PaymentSummary({
  originalPrice,
  finalPrice,
  isProcessing,
  onPaymentClick,
  paymentError,
}: PaymentSummaryProps) {
  const hasDiscount = originalPrice !== finalPrice;
  const earnedCashback = calculateCashback(finalPrice);

  return (
    <div className={styles.footer}>
      {paymentError && (
        <div className={styles.error}>
          {paymentError}
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
        onClick={onPaymentClick}
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