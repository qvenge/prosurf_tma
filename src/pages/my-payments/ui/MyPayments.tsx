import { InfiniteScrollList } from '@/shared/ui';
import { useInfinitePayments, type PaymentListItem } from '@/shared/api';
import { PageLayout } from '@/widgets/page-layout';

import { formatPaymentDate, getCategoryInfo, formatPaymentAmount, formatCashbackAmount } from '../lib/helpers';
import { PaymentEntry } from './PaymentEntry.tsx';

import styles from './MyPayments.module.scss';

export function MyPayments() {
  const query = useInfinitePayments({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: ['SUCCEEDED', 'FAILED']
  });

  return (
    <PageLayout title="История покупок">
      <div className={styles.wrapper}>
        <InfiniteScrollList
          query={query}
          renderItem={(payment: PaymentListItem) => {
            const paymentData = {
              id: payment.id,
              purpose: payment.name ?? 'Покупка',
              ...getCategoryInfo(payment.category, payment.labels),
              cost: formatPaymentAmount(payment.price),
              cashback: formatCashbackAmount(payment.cashback),
              status: payment.status,
            };
            return <PaymentEntry key={payment.id} data={paymentData} />;
          }}
          groupBy={(payment: PaymentListItem) => formatPaymentDate(payment.createdAt)}
          renderGroupHeader={(day: string) => (
            <div className={styles.day}>{day}</div>
          )}
          emptyMessage="У вас пока нет покупок"
          errorMessage="Ошибка загрузки покупок"
          listClassName={styles.dayBlocks}
          itemGap={20}
        />
      </div>
    </PageLayout>
  );
}

