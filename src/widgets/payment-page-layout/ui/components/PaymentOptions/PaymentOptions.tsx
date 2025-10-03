import { Switch } from '@/shared/ui';
import { formatPrice } from '../../../lib/helpers';
import { PAYMENT_CONSTANTS } from '../../../lib/constants';
import type { PaymentOptionsConfig } from '../../../model/types';
import styles from './PaymentOptions.module.scss';

interface PaymentOptionsProps {
  options: PaymentOptionsConfig;
}

export function PaymentOptions({ options }: PaymentOptionsProps) {
  const { cashback, certificate } = options;

  // Don't render if no options are enabled
  if (!cashback?.enabled && !certificate?.enabled) {
    return null;
  }

  return (
    <div className={styles.options}>
      {/* Cashback option */}
      {cashback?.enabled && cashback.value > 0 && (
        <>
          <div className={styles.settingItem}>
            <div className={styles.settingItemInfo}>
              <div className={styles.settingItemName}>
                Кэшбек: {formatPrice(cashback.total)} {PAYMENT_CONSTANTS.CURRENCY}
              </div>
              <div className={styles.settingItemDescription}>
                Списать {formatPrice(cashback.value)} {PAYMENT_CONSTANTS.CURRENCY} бонусов?
              </div>
            </div>
            <div className={styles.settingItemControl}>
              <Switch
                checked={cashback.active}
                onChange={({ currentTarget }) => cashback.onChange(currentTarget.checked)}
              />
            </div>
          </div>
          <div className={styles.divider} />
        </>
      )}

      {/* Certificate option */}
      {certificate?.enabled && certificate.value > 0 && (
        <>
          <div className={styles.settingItem}>
            <div className={styles.settingItemInfo}>
              <div className={styles.settingItemName}>
                Сертификат: {formatPrice(certificate.value)} {PAYMENT_CONSTANTS.CURRENCY}
              </div>
              <div className={styles.settingItemDescription}>
                Списать {formatPrice(certificate.value)} {PAYMENT_CONSTANTS.CURRENCY}?
              </div>
            </div>
            <div className={styles.settingItemControl}>
              <Switch
                checked={certificate.active}
                onChange={({ currentTarget }) => certificate.onChange(currentTarget.checked)}
              />
            </div>
          </div>
          <div className={styles.divider} />
        </>
      )}
    </div>
  );
}