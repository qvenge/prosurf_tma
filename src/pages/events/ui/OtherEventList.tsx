import { Link } from '@/shared/navigation';
import styles from './OtherEventList.module.scss';
import { OtherEventCard } from './OtherEventCard';
import { useSessions } from '@/shared/api';
import { groupSessionsByDate } from '@/shared/lib/date-utils';
import { EmptyListStub, Spinner } from '@/shared/ui';
import { useMemo } from 'react';

export const OtherEventList = () => {
  const filters = useMemo(() => ({
    'labels.any': ['activity'],
    startsAfter: new Date().toISOString(),
  }), []);

  const { data, isLoading, error } = useSessions(filters);

  const otherEvents = data?.items || [];

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
        <div>Ошибка загрузки событий</div>
      </div>
    );
  }

  if (otherEvents.length === 0) {
    return (
      <div className={styles.stub}>
        <EmptyListStub message='Пока нет доступных событий' />
      </div>
    );
  }

  const groupedEvents = groupSessionsByDate(otherEvents);

  return (
    <div className={styles.wrapper}>
      {groupedEvents.map((group) => (
        <div key={group.date} className={styles.eventsBlock}>
          <div className={styles.day}>{group.date}</div>
          {group.events.map((event) => (
            <Link key={event.id} to={`/events/sessions/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <OtherEventCard data={event} />
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};
