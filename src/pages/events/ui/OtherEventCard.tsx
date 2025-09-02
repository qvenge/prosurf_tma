
import styles from './OtherEventCard.module.scss';

interface OtherEventCardProps {
  data: {
    imgSrc: string;
    time: string;
    name: string;
    location: string;
    price: string;
    remainingSeats: number;
  }
}

export const OtherEventCard = ({
 data
}: OtherEventCardProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.nameTime}>
        <div className={styles.name}>{data.name}</div>
        <div className={styles.time}>{data.time}</div>
      </div>
      <div className={styles.location}>{data.location}</div>
      <div className={styles.priceSeats}>
        <div className={styles.price}>{data.price}</div>
        <div className={styles.seats}>{data.remainingSeats} места</div>
      </div>
    </div>
  );
};