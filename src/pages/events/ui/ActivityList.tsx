import { Link } from '@/shared/navigation';
import styles from './ActivityList.module.scss';
import { useSessionsInfinite, type Session } from '@/shared/api';
import { formatSessionDate } from '@/shared/lib/date-utils';
import { InfiniteScrollList, ActivityCard } from '@/shared/ui';
import { useMemo } from 'react';

export const ActivityList = () => {
  const filters = useMemo(() => ({
    'labels.any': ['activity'],
    startsAfter: new Date().toISOString(),
  }), []);

  const query = useSessionsInfinite(filters);

  return (
    <div className={styles.wrapper}>
      <InfiniteScrollList
        query={query}
        renderItem={(session: Session) => (
          <Link key={session.id} to={`/events/sessions/${session.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ActivityCard data={session} />
          </Link>
        )}
        groupBy={(session: Session) => formatSessionDate(session.startsAt)}
        renderGroupHeader={(day: string) => (
          <div className={styles.day}>{day}</div>
        )}
        emptyMessage="Пока нет доступных событий"
        errorMessage="Ошибка загрузки событий"
        listClassName={styles.eventsBlock}
      />
    </div>
  );
};
