import { useMemo } from 'react';
import { useBookings, type BookingFilters } from '@/shared/api';
import { Spinner } from '@/shared/ui';
import styles from './HorizontalBookingList.module.scss';
import { SmallBookingCard } from './SmallBookingCard';

export function HorizontalBookingList() {
  const filters: BookingFilters = useMemo(() => ({
    status: ['CONFIRMED'],
    includeSession: true,
    limit: 50,
    startsAfter: new Date().toISOString(),
    sortBy: 'startsAt',
    sortOrder: 'asc'
  }), []);

  const { data, isLoading } = useBookings(filters);

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