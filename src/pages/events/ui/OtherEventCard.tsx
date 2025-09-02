
import styles from './OtherEventCard.module.scss';
import { formatTime } from '@/shared/lib/date-utils';
import { formatPrice, formatAvailability } from '@/shared/lib/format-utils';
import type { EventSession } from '@/shared/api/schemas';

interface OtherEventCardProps {
  data: EventSession;
}

export const OtherEventCard = ({
 data
}: OtherEventCardProps) => {
  const time = formatTime(data.start);
  const price = formatPrice(data.price);
  const availability = formatAvailability(data.remainingSeats);

  return (
    <div className={styles.wrapper}>
      <div className={styles.nameTime}>
        <div className={styles.name}>{data.title}</div>
        <div className={styles.time}>{time}</div>
      </div>
      <div className={styles.location}>{data.location}</div>
      <div className={styles.priceSeats}>
        <div className={styles.price}>{price}</div>
        <div className={styles.seats}>{availability.text}</div>
      </div>
    </div>
  );
};