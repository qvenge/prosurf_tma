import { Switch } from '@/shared/ui';
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
  cashbackValue: number;
  activeCashback: boolean;
  onCashbackChange: (checked: boolean) => void;
}

export function PriceBreakdown({
  product,
  selectedPlan,
  session,
  sessionPrice,
  subscriptionPrice,
  cashbackValue,
  activeCashback,
  onCashbackChange,
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

      <div className={styles.divider} />

      {cashbackValue > 0 && (
        <>
          <div className={styles.settingItem}>
            <div className={styles.settingItemInfo}>
              <div className={styles.settingItemName}>
                Кэшбек: {formatPrice(cashbackValue)} {PAYMENT_CONSTANTS.CURRENCY}
              </div>
              <div className={styles.settingItemDescription}>
                Списать {formatPrice(cashbackValue)} {PAYMENT_CONSTANTS.CURRENCY} бонусов?
              </div>
            </div>
            <div className={styles.settingItemControl}>
              <Switch 
                checked={activeCashback} 
                onChange={({currentTarget}) => onCashbackChange(currentTarget.checked)}
              />
            </div>
          </div>
          <div className={styles.divider} />
        </>
      )}

      <div className={styles.settingItem}>
        <div className={styles.settingItemInfo}>
          <div className={styles.settingItemName}>сертификат: 15 000 ₽</div>
          <div className={styles.settingItemDescription}>Cписать 7 900 ₽?</div>
        </div>
        <div className={styles.settingItemControl}>
          <Switch />
        </div>
      </div>

      <div className={styles.divider} />
    </div>
  );
}