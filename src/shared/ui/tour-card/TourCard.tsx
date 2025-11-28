
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
  const chipiesTicket = data.event.tickets.length > 0 ? data.event.tickets.reduce(
    (min, ticket) => ticket.full.price.amountMinor < min.full.price.amountMinor ? ticket : min,
    data.event.tickets[0]
  ) : undefined;

  const price = chipiesTicket?.prepayment && chipiesTicket?.prepayment.price.amountMinor > 0 ?
    chipiesTicket.prepayment.price : chipiesTicket?.full?.price;

  const formatedPrice = formatPrice(price);
  const availability = formatAvailability(data.remainingSeats);

  const imageUrl = data.event.images?.[0];


  return (
    <div className={styles.wrapper}>
      {imageUrl && <img src={imageUrl} alt={data.event.title} className={styles.img} />}
      <div className={styles.content}>
        <div className={styles.datesYear}>
          <div className={styles.dates}>{dates}</div>
          <div className={styles.year}>{year}</div>
        </div>
        <div className={styles.name}>{data.event.title}</div>
        <div className={styles.location}>{data.event.location || 'Место не указано'}</div>
        <div className={styles.priceSeats}>
          <div className={styles.price}>{formatedPrice}</div>
          <div className={styles.seats}>{availability.text}</div>
        </div>
      </div>
    </div>
  );
};