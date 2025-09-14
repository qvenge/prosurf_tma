import { Link } from '@/shared/navigation';
import styles from './TourList.module.scss';
import { TourCard } from './TourCard';
// TODO: Implement with new API structure using useEvents with filters
// import { useEvents } from '@/shared/api';

export const TourList = () => {
  // TODO: Replace with useEvents filtered by type
  const tours: any[] = [];
  const isLoading = false;
  const error = null;

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