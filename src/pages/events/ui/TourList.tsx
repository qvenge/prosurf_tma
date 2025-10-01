import { Link } from '@/shared/navigation';
import styles from './TourList.module.scss';
import { TourCard } from './TourCard';
import { useSessions } from '@/shared/api';
import { EmptyListStub, Spinner } from '@/shared/ui';
import { useMemo } from 'react';

export const TourList = () => {
  const filters = useMemo(() => ({
    'labels.any': ['tour'],
    startsAfter: new Date().toISOString(),
  }), []);

  const { data, isLoading, error } = useSessions(filters);

  const tours = data?.items || [];

  if (isLoading) {
    return (
      <div className={styles.stub}>
        <Spinner size="l" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.stub}>
        <div>Ошибка загрузки туров</div>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div className={styles.stub}>
        <EmptyListStub message='Пока нет доступных туров' />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {tours.map((tour) => (
        <Link key={tour.id} to={`/events/sessions/${tour.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <TourCard data={tour} />
        </Link>
      ))}
    </div>
  );
};