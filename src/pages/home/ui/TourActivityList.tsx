import { Link } from '@/shared/navigation';
import { useSessionsInfinite } from '@/shared/api';
import { SESSION_START_DATE } from '@/shared/lib/date-utils';
import { InfiniteScrollList, TourCard, ActivityCard } from '@/shared/ui';
import { useMemo } from 'react';
import type { Session } from '@/shared/api/types';

import styles from './TourActivityList.module.scss';

export function TourActivityList() {
  const filters = useMemo(() => ({
    'labels.any': ['tour', 'activity'],
    startsAfter: SESSION_START_DATE,
  }), []);

  const query = useSessionsInfinite(filters);

  return (
    <InfiniteScrollList
      query={query}
      renderItem={(session: Session) => (
        <Link key={session.id} to={`/events/sessions/${session.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {session.labels!.includes('tour') ? <TourCard data={session} /> : <ActivityCard data={session} />}
        </Link>
      )}
      emptyMessage="Пока нет доступных туров или ивентов"
      errorMessage="Ошибка загрузки туров и ивентов"
      listClassName={styles.wrapper}
    />
  );
};