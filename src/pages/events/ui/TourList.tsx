import { Link } from '@/shared/navigation';
import styles from './TourList.module.scss';
import { useSessionsInfinite, type Session } from '@/shared/api';
import { InfiniteScrollList, TourCard } from '@/shared/ui';
import { useMemo } from 'react';

export const TourList = () => {
  const filters = useMemo(() => ({
    'labels.any': ['tour'],
    startsAfter: new Date().toISOString(),
  }), []);

  const query = useSessionsInfinite(filters);

  return (
    <div className={styles.wrapper}>
      <InfiniteScrollList
        query={query}
        renderItem={(session: Session) => (
          <Link key={session.id} to={`/events/sessions/${session.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <TourCard data={session} />
          </Link>
        )}
        emptyMessage="Пока нет доступных туров"
        errorMessage="Ошибка загрузки туров"
      />
    </div>
  );
};