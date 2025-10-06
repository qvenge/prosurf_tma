import { Link } from '@/shared/navigation';
import { useSessions } from '@/shared/api';
import { Spinner, TourCard, ActivityCard } from '@/shared/ui';
import { useMemo } from 'react';

import styles from './TourActivityList.module.scss';

export function TourActivityList() {
  const filters = useMemo(() => ({
    'labels.any': ['tour', 'activity'],
    startsAfter: new Date().toISOString(),
  }), []);

  const { data, isLoading, error } = useSessions(filters);

  const sessions = data?.items || [];

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
        <div>Ошибка загрузки туров и ивентов</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={styles.stub}>
        Пока нет доступных туров или ивентов
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {sessions.map((session) => (
        <Link key={session.id} to={`/events/sessions/${session.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {session.labels!.includes('tour') ? <TourCard data={session} /> : <ActivityCard data={session} />}
        </Link>
      ))}
    </div>
  );
};