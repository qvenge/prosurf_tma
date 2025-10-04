import { Icon } from '@/shared/ui';
import clsx from 'clsx';

import { getStatusLabel, type PaymentEntryData } from '../lib/helpers';

import styles from './MyPayments.module.scss';

export function PaymentEntry({data}: {data: PaymentEntryData}) {
  const showCashback = data.status === 'SUCCEEDED' && data.cashback;
  const showStatus = data.status !== 'SUCCEEDED';

  return (
    <div className={styles.entry}>
      <div className={styles.categoryIcon}>
        <Icon src={data.icon} width={20} height={20} />
      </div>
      <div className={styles.info}>
        <div className={styles.purpose}>{data.purpose}</div>
        <div className={styles.category}>{data.label}</div>
      </div>
      <div className={styles.costStatus}>
        <div className={styles.cost}>{data.cost}</div>
        {showCashback ? (
          <div className={styles.cashback}>{data.cashback}</div>
        ) : showStatus ? (
          <div className={clsx(styles.status, styles[data.status.toLowerCase()])}>
            {getStatusLabel(data.status)}
          </div>
        ) : null}
      </div>
    </div>
  );
}