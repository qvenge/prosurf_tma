import { useUpcomingEventSessions, type EventSession } from '@/shared/api';
import { CategoryItem } from './CategoryItem';
import styles from './TrainingCategories.module.scss';

const formatUpcomingDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} в ${hours}:${minutes}`;
};

const types: EventSession['type'][] = ['surfingTraining', 'surfskateTraining'];

export const TrainingCategories = () => {
  const { data: allSessions, isLoading, error } = useUpcomingEventSessions(
    { types },
    { 
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: false,
    }
  );

  const getNextSessionByType = (sessions: EventSession[] | undefined, type: 'surfingTraining' | 'surfskateTraining'): EventSession | null => {
    if (!sessions || sessions.length === 0) return null;
    const filteredSessions = sessions.filter(session => session.type === type);
    return filteredSessions.length > 0 ? filteredSessions[0] : null;
  };

  const nextSurfingSession = getNextSessionByType(allSessions, 'surfingTraining');
  const nextSurfskateSession = getNextSessionByType(allSessions, 'surfskateTraining');

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h1 className={styles.title}>Тренировки</h1>
        <div className={styles.categories}>
          <div className={styles.categoryList}>
            <CategoryItem
              title="Серфинг"
              imageUrl="/images/surfing1.jpg"
              nextSession={nextSurfingSession}
              isLoading={isLoading}
              error={!!error}
              formatUpcomingDate={formatUpcomingDate}
            />
            <CategoryItem
              title="Серфскейт"
              imageUrl="/images/surfskate1.png"
              nextSession={nextSurfskateSession}
              isLoading={isLoading}
              error={!!error}
              formatUpcomingDate={formatUpcomingDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};