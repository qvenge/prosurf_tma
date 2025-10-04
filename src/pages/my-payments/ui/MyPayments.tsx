import clsx from 'clsx';
import { EmptyListStub, Spinner } from '@/shared/ui';
import { usePayments } from '@/shared/api';
import { PageLayout } from '@/widgets/page-layout';

import { groupPaymentsByDate, type PaymentGroup } from '../lib/helpers';
import { PaymentEntry } from './PaymentEntry.tsx';

import styles from './MyPayments.module.scss';

export function MyPayments() {
  const { data, isLoading, error } = usePayments({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: ['SUCCEEDED', 'FAILED']
  });

  const blocks = data?.items ? groupPaymentsByDate(data.items) : [];

  return (
    <PageLayout title="История покупок">
      <div className={styles.wrapper}>
        <PaymentList
          isLoading={isLoading}
          error={error}
          blocks={blocks}
        />
      </div>
    </PageLayout>
  );
}

function PaymentList({blocks, isLoading, error}: {blocks: PaymentGroup[], isLoading: boolean, error: any}) {
  if (isLoading) {
    return (
      <div className={styles.stub}>
        <Spinner size="l" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.stub, styles.error)}>
        <div>Ошибка загрузки покупок</div>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className={styles.stub}>
        <EmptyListStub message="У вас пока нет покупок" />
      </div>
    );
  }


  return (
    <div className={styles.dayBlocks}>
      {blocks.map((block) => (
        <div key={block.day} className={styles.dayBlock}>
          <div className={styles.day}>{block.day}</div>
          {block.items.map((event) => (
            <PaymentEntry key={event.id} data={event} />
          ))}
        </div>
      ))}
    </div>
  )
}

