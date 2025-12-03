import { Switch } from '@/shared/ui';
import { PAYMENT_CONSTANTS } from '../../../lib/constants';
import type { PaymentOptionsConfig } from '../../../model/types';
import styles from './PaymentOptions.module.scss';

interface PaymentOptionsProps {
  options: PaymentOptionsConfig;
}

export function PaymentOptions({ options }: PaymentOptionsProps) {
  const { bonus, certificate } = options;

  // Don't render if no options are enabled and no error component
  if (!bonus?.enabled && !certificate?.enabled && !bonus?.errorComponent) {
    return null;
  }

  return (
    <div className={styles.options}>
      {/* Bonus option */}
      {bonus?.errorComponent ? (
        // Show error component if provided
        <>
          {bonus.errorComponent}
          <div className={styles.divider} />
        </>
      ) : bonus?.enabled && bonus.value > 0 ? (
        <>
          <div className={styles.settingItem}>
            <div className={styles.settingItemInfo}>
              <div className={styles.settingItemName}>
                Бонусы: {bonus.total.toLocaleString('ru-RU')}
              </div>
              <div className={styles.settingItemDescription}>
                Списать {Math.floor(bonus.value / PAYMENT_CONSTANTS.MINOR_CURRENCY_DIVISOR).toLocaleString('ru-RU')} бонусов?
              </div>
            </div>
            <div className={styles.settingItemControl}>
              <Switch
                checked={bonus.active}
                onChange={({ currentTarget }) => bonus.onChange(currentTarget.checked)}
              />
            </div>
          </div>
          <div className={styles.divider} />
        </>
      ) : null}
    </div>
  );
}