import { formatPrice, getEventTypeLabel } from '../../../lib/helpers';
import { PAYMENT_CONSTANTS } from '../../../lib/constants';
import type { ProductType, EventType } from '../../../model/types';
import styles from './PriceBreakdown.module.scss';

interface PriceBreakdownProps {
  product: ProductType;
  selectedPlan?: {
    id: string;
    name: string;
    priceMinor: number;
  };
  session: {
    title: string;
    type: EventType;
    price: { amount: string; currency: string };
  };
  sessionPrice: number;
  subscriptionPrice: number;
}

export function PriceBreakdown({
  product,
  selectedPlan,
  session,
  sessionPrice,
  subscriptionPrice,
}: PriceBreakdownProps) {
  const productName = product === 'subscription' 
    ? (selectedPlan?.name || 'Абонемент')
    : session.title;
  const displayPrice = product === 'subscription' ? subscriptionPrice : sessionPrice;

  return (
    <div className={styles.breakdown}>
      <div className={styles.description}>
        <div className={styles.info}>
          <div className={styles.productName}>{productName}</div>
          <div className={styles.productPurpose}>
            {getEventTypeLabel(session.type)}
          </div>
        </div>
        <div className={styles.price}>
          {`${formatPrice(displayPrice)} ${PAYMENT_CONSTANTS.CURRENCY}`}
        </div>
      </div>

    </div>
  );
}