import { Link } from '@/shared/navigation';
import styles from './OtherEventList.module.scss';
import { OtherEventCard } from './OtherEventCard';
import { useEventSessionsByType } from '@/shared/api';
import { groupEventsByDate } from '@/shared/lib/date-utils';

export const OtherEventList = () => {
  const { data: otherEvents, isLoading, error } = useEventSessionsByType('other');

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div>Загрузка событий...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div>Ошибка загрузки событий</div>
      </div>
    );
  }

  if (!otherEvents || otherEvents.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div>Событий пока нет</div>
      </div>
    );
  }

  const groupedEvents = groupEventsByDate(otherEvents);

  return (
    <div className={styles.wrapper}>
      {groupedEvents.map((group) => (
        <div key={group.date} className={styles.eventsBlock}>
          <div className={styles.day}>{group.date}</div>
          {group.events.map((event) => (
            <Link key={event.id} to={`/events/sessions/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <OtherEventCard key={event.id} data={event} />
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
};
