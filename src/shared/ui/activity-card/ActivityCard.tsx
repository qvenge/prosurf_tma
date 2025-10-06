
import styles from './ActivityCard.module.scss';
import { formatTime } from '@/shared/lib/date-utils';
import { formatPrice, formatAvailability } from '@/shared/lib/format-utils';
import type { Session } from '@/shared/api';

interface ActivityCardProps {
  data: Session;
}

export const ActivityCard = ({
 data
}: ActivityCardProps) => {
  const time = formatTime(data.startsAt);
  const price = formatPrice(data.event.tickets[0]?.full?.price);
  const availability = formatAvailability(data.remainingSeats);

  return (
    <div className={styles.wrapper}>
      <div className={styles.nameTime}>
        <div className={styles.name}>{data.event.title}</div>
        <div className={styles.time}>{time}</div>
      </div>
      <div className={styles.location}>{data.event.location || 'Место не указано'}</div>
      <div className={styles.priceSeats}>
        <div className={styles.price}>{price}</div>
        <div className={styles.seats}>{availability.text}</div>
      </div>
    </div>
  );
};