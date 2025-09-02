
import styles from './TourCard.module.scss';

interface TourCardProps {
  data: {
    imgSrc: string;
    dates: string;
    year: string;
    name: string;
    location: string;
    price: string;
    remainingSeats: number;
  }
}

export const TourCard = ({
 data
}: TourCardProps) => {
  return (
    <div className={styles.wrapper}>
      <img src={data.imgSrc} alt={data.name} className={styles.img} />
      <div className={styles.content}>
        <div className={styles.datesYear}>
          <div className={styles.dates}>{data.dates}</div>
          <div className={styles.year}>{data.year}</div>
        </div>
        <div className={styles.name}>{data.name}</div>
        <div className={styles.location}>{data.location}</div>
        <div className={styles.priceSeats}>
          <div className={styles.price}>{data.price}</div>
          <div className={styles.seats}>{data.remainingSeats} места</div>
        </div>
      </div>
    </div>
  );
};