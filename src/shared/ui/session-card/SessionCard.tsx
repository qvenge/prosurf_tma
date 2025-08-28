import styles from './SessionCard.module.scss';

export interface SessionCardProps {
  time: string;
  duration?: string;
  title: string;
  location: string;
  price: string;
  availability: {
    hasSeats: boolean;
    text: string;
  };
}

export const SessionCard = ({ 
  time, 
  duration, 
  title, 
  location, 
  price, 
  availability 
}: SessionCardProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.time}>{time}</div>
          {duration && <div className={styles.duration}>{duration}</div>}
        </div>
        <div className={styles.body}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.location}>
            {location}
          </p>
        </div>
        <div className={styles.footer}>
          <div className={styles.price}>{price}</div>
          <div className={`${styles.availability} ${availability.hasSeats ? styles.hasSeats : styles.noSeats}`}>
            {availability.text}
          </div>
        </div>
      </div>
    </div>
  );
};