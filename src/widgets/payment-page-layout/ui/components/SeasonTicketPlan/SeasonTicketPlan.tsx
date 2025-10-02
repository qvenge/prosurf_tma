import type { SeasonTicketPlan } from '@/shared/api';
import styles from './SeasonTicketPlan.module.scss';
import { pluralize } from '@/shared/lib/string';
import { formatPrice } from '@/shared/lib/format-utils';

interface SeasonTicketPlanProps {
  data: SeasonTicketPlan
}

export function SeasonTicketPlan({ data }: SeasonTicketPlanProps) {
  const productName = `Абонемент ${data.passes} ${pluralize(data.passes, ['занятие', 'занятия', 'занятий'])}`;

  return (
    <div className={styles.breakdown}>
      <div className={styles.description}>
        <div className={styles.info}>
          <div className={styles.productName}>{productName}</div>
          <div className={styles.productPurpose}>{data.description}</div>
        </div>
        <div className={styles.price}>{formatPrice(data.price)}</div>
      </div>
    </div>
  );
}