import { useBookings } from '@/shared/api';
import { Spinner } from '@/shared/ui';
import styles from './HorizontalBookingList.module.scss';
import { SmallBookingCard } from './SmallBookingCard';

export function HorizontalBookingList() {
  const { data, isLoading } = useBookings({ status: ['CONFIRMED'], includeSession: true });

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.stub}>
          <Spinner size='l' />
        </div>
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.stub}>Нет активных записей</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.list}>
        {data.items.map((booking) => (
          <SmallBookingCard key={booking.id} data={booking} />
        ))}
      </div>
    </div>
  );
}