
import styles from './TourCard.module.scss';
import { formatTourDates } from '@/shared/lib/date-utils';
import { formatPrice, formatAvailability } from '@/shared/lib/format-utils';
import type { EventSession } from '@/shared/api/schemas';

interface TourCardProps {
  data: EventSession;
}

export const TourCard = ({
 data
}: TourCardProps) => {
  const { dates, year } = formatTourDates(data.start, data.end);
  const price = formatPrice(data.price);
  const availability = formatAvailability(data.remainingSeats);

  return (
    <div className={styles.wrapper}>
      <img src="/images/surfing1.jpg" alt={data.title} className={styles.img} />
      <div className={styles.content}>
        <div className={styles.datesYear}>
          <div className={styles.dates}>{dates}</div>
          <div className={styles.year}>{year}</div>
        </div>
        <div className={styles.name}>{data.title}</div>
        <div className={styles.location}>{data.location}</div>
        <div className={styles.priceSeats}>
          <div className={styles.price}>{price}</div>
          <div className={styles.seats}>{availability.text}</div>
        </div>
      </div>
    </div>
  );
};