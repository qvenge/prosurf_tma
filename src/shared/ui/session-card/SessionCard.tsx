import { useNavigate } from 'react-router';
import styles from './SessionCard.module.scss';

export interface SessionCardProps {
  id: string;
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
  id,
  time, 
  duration, 
  title, 
  location, 
  price, 
  availability 
}: SessionCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trainings/sessions/${id}`);
  };

  return (
    <div className={styles.wrapper} onClick={handleClick} style={{ cursor: 'pointer' }}>
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