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
    <div className={styles.sessionCard}>
      <div className={styles.cardContent}>
        <div className={styles.timePrice}>
          <span className={styles.time}>{time}</span>
          {duration && <span className={styles.duration}>{duration}</span>}
        </div>
        <div className={styles.sessionInfo}>
          <h3 className={styles.sessionTitle}>{title}</h3>
          <p className={styles.location}>
            {location.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < location.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
        <span className={styles.price}>{price}</span>
        <span className={`${styles.availability} ${availability.hasSeats ? styles.hasSeats : styles.noSeats}`}>
          {availability.text}
        </span>
      </div>
    </div>
  );
};