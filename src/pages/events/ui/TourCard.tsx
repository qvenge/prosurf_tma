
import styles from './TourCard.module.scss';
import { formatTourDates } from '@/shared/lib/date-utils';
import { formatPrice, formatAvailability } from '@/shared/lib/format-utils';
import type { Session } from '@/shared/api';

interface TourCardProps {
  data: Session;
}

export const TourCard = ({
 data
}: TourCardProps) => {
  const { dates, year } = formatTourDates(data.startsAt, data.endsAt || data.startsAt);
  const price = formatPrice(data.event.tickets[0]?.prepayment?.price);
  const availability = formatAvailability(data.remainingSeats);

  return (
    <div className={styles.wrapper}>
      <img src="/images/surfing1.jpg" alt={data.event.title} className={styles.img} />
      <div className={styles.content}>
        <div className={styles.datesYear}>
          <div className={styles.dates}>{dates}</div>
          <div className={styles.year}>{year}</div>
        </div>
        <div className={styles.name}>{data.event.title}</div>
        <div className={styles.location}>{data.event.location || 'Место не указано'}</div>
        <div className={styles.priceSeats}>
          <div className={styles.price}>{price}</div>
          <div className={styles.seats}>{availability.text}</div>
        </div>
      </div>
    </div>
  );
};