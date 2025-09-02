import { EmptyListStub, Icon } from '@/shared/ui'
import { BarbellBold, ConfettiBold, AirplaneTiltBold, CertificateBold } from '@/shared/ds/icons'
import { type PaymentStatus } from '@/shared/api'
import { PageLayout } from '@/widgets/page-layout'
import clsx from 'clsx';

import styles from './MyPayments.module.scss';

interface PaymentEntryData {
  id: string,
  purpose: string;
  categoryIcon: string;
  category: string;
  cost: string;
  cashback?: string;
  status: PaymentStatus;
}

const blocks: Array<{day: string, items: PaymentEntryData[] }> = [
  {
    day: '3 июля • четверг',
    items: [
      {
        id: '1',
        purpose: 'Абонемент 5 занятий',
        categoryIcon: BarbellBold,
        category: 'Серфинг',
        cost: '− 35 000 ₽',
        cashback: '+350',
        status: 'SUCCEEDED',
      },
      {
        id: '2',
        purpose: 'Разовая тренировка',
        categoryIcon: BarbellBold,
        category: 'Серфинг',
        cost: '− 1 500 ₽',
        cashback: '+150',
        status: 'SUCCEEDED',
      }
    ]
  },
  {
    day: '4 июля • пятница',
    items: [
      {
        id: '3',
        purpose: 'Предоплата «Балли»',
        categoryIcon: AirplaneTiltBold,
        category: 'Тур',
        cost: '− 5 000 ₽',
        status: 'FAILED',
      },
      {
        id: '4',
        purpose: 'SurfSkate Встреча',
        categoryIcon: ConfettiBold,
        category: 'Ивенты',
        cost: '− 1 500 ₽',
        cashback: '+150',
        status: 'SUCCEEDED',
      },
      {
        id: '5',
        purpose: 'Покупка сертификата',
        categoryIcon: CertificateBold,
        category: 'Сертификаты',
        cost: '− 7 900 ₽',
        cashback: '+150',
        status: 'SUCCEEDED',
      }
    ]
  }
];

export function MyPayments() {
  return (
    <PageLayout title="История покупок">
    <div className={styles.wrapper}>
        {blocks.length > 0 ? (
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
        ) : (
          <div className={styles.emptyStub}>
            <EmptyListStub message="У вас пока нет записей" />
          </div>
        )}
    </div>
    </PageLayout>
  );
}


function PaymentEntry({data}: {data: PaymentEntryData}) {
  return (
    <div className={styles.entry}>
      <div className={styles.categoryIcon}>
        <Icon src={data.categoryIcon} width={20} height={20} />
      </div>
      <div className={styles.info}>
        <div className={styles.purpose}>{data.purpose}</div>
        <div className={styles.category}>{data.category}</div>
      </div>
      <div className={styles.costStatus}>
        <div className={styles.cost}>{data.cost}</div>
        {data.status === 'SUCCEEDED' && data.cashback ? (
          <div className={styles.cashback}>{data.cashback}</div>
        ) : (
          <div className={clsx(styles.status, styles[data.status.toLowerCase()])}>отклонена</div>
        )}
      </div>
    </div>
  );
}
