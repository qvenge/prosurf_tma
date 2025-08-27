import { Icon } from '@/shared/ui/icon';
import { CaretRightBold } from '@/shared/ds/icons';
import { useUpcomingEventSessions, type EventSession } from '@/shared/api';
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
            <div className={`${styles.categoryItem} ${!nextSurfingSession && !isLoading && !error ? styles.categoryItemDisabled : ''}`}>
              <div 
                className={styles.categoryImage}
                style={{ backgroundImage: 'url(/images/surfing1.jpg)' }}
              />
              <div className={styles.categoryContent}>
                <h2 className={styles.categoryTitle}>Серфинг</h2>
                <p className={styles.categorySchedule}>
                  {isLoading ? 
                    'Загружаем...' :
                    error ? 
                      'Ошибка загрузки' :
                    nextSurfingSession ? 
                      `Ближайшая: ${formatUpcomingDate(nextSurfingSession.start)}` : 
                      'Нет доступных тренировок'
                  }
                </p>
              </div>
              {nextSurfingSession && !isLoading && !error && (
                <Icon 
                  src={CaretRightBold} 
                  className={styles.categoryIcon}
                  width={20}
                  height={20}
                />
              )}
            </div>
            <div className={`${styles.categoryItem} ${!nextSurfskateSession && !isLoading && !error ? styles.categoryItemDisabled : ''}`}>
              <div 
                className={styles.categoryImage}
                style={{ backgroundImage: 'url(/images/surfskate1.png)' }}
              />
              <div className={styles.categoryContent}>
                <h2 className={styles.categoryTitle}>Серфскейт</h2>
                <p className={styles.categorySchedule}>
                  {isLoading ? 
                    'Загружаем...' :
                    error ? 
                      'Ошибка загрузки' :
                    nextSurfskateSession ? 
                      `Ближайшая: ${formatUpcomingDate(nextSurfskateSession.start)}` : 
                      'Нет доступных тренировок'
                  }
                </p>
              </div>
              {nextSurfskateSession && !isLoading && !error && (
                <Icon 
                  src={CaretRightBold} 
                  className={styles.categoryIcon}
                  width={20}
                  height={20}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};