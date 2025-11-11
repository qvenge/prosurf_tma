import type { PaginatedResponse, Booking } from '@/shared/api';
import { Spinner } from '@/shared/ui';
import styles from './HorizontalBookingList.module.scss';
import { SmallBookingCard } from './SmallBookingCard';

interface HorizontalBookingListProps {
  data: PaginatedResponse<Booking>;
  isLoading: boolean;
}

export function HorizontalBookingList({ data, isLoading }: HorizontalBookingListProps) {
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.stub}>
          <Spinner size='l' />
        </div>
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