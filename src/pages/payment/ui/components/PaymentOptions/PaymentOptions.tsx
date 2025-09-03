import { Switch } from '@/shared/ui';
import { formatPrice } from '../../../lib/helpers';
import { PAYMENT_CONSTANTS } from '../../../lib/constants';
import styles from './PaymentOptions.module.scss';

interface PaymentOptionsProps {
  cashbackValue: number;
  activeCashback: boolean;
  onCashbackChange: (checked: boolean) => void;
}

export function PaymentOptions({
  cashbackValue,
  activeCashback,
  onCashbackChange,
}: PaymentOptionsProps) {
  return (
    <div className={styles.options}>
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