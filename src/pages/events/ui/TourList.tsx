import { Link } from '@/shared/navigation';
import styles from './TourList.module.scss';
import { TourCard } from './TourCard';
import { useEventSessionsByType } from '@/shared/api';

export const TourList = () => {
  const { data: tours, isLoading, error } = useEventSessionsByType('tour');

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div>Загрузка туров...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div>Ошибка загрузки туров</div>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div>Туров пока нет</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {tours.map((tour) => (
        <Link key={tour.id} to={`/events/sessions/${tour.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <TourCard key={tour.id} data={tour} />
        </Link>
      ))}
    </div>
  );
};