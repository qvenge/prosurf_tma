import { useNavigate } from 'react-router';
import { Icon } from '@/shared/ui/icon';
import { CaretRightBold } from '@/shared/ds/icons';
import { useEventSessions, type EventSession } from '@/shared/api';
import styles from './CategoryItem.module.scss';

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

interface CategoryItemProps {
  title: string;
  imageUrl: string;
  trainingType: EventSession['type'];
}

export const CategoryItem = ({
  title,
  imageUrl,
  trainingType
}: CategoryItemProps) => {
  const navigate = useNavigate();
  const { data: sessions, isLoading, error } = useEventSessions(
    { 
      filters: { types: [trainingType] },
      offset: 0,
      limit: 1
    },
    { 
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: false,
    }
  );

  const nextSession = sessions && sessions.length > 0 ? sessions[0] : null;

  const handleClick = () => {
    if (nextSession && !isLoading && !error) {
      const categoryId = trainingType === 'surfingTraining' ? 'surfing' : 'surfskate';
      navigate(`/trainings/${categoryId}`);
    }
  };

  return (
    <div 
      className={`${styles.categoryItem} ${!nextSession && !isLoading && !error ? styles.categoryItemDisabled : ''}`}
      onClick={handleClick}
      style={{ cursor: nextSession && !isLoading && !error ? 'pointer' : 'default' }}
    >
      <div 
        className={styles.categoryImage}
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className={styles.categoryContent}>
        <h2 className={styles.categoryTitle}>{title}</h2>
        <p className={styles.categorySchedule}>
          {isLoading ? 
            'Загружаем...' :
            error ? 
              'Ошибка загрузки' :
            nextSession ? 
              `Ближайшая: ${formatUpcomingDate(nextSession.start)}` : 
              'Нет доступных тренировок'
          }
        </p>
      </div>
      {nextSession && !isLoading && !error && (
        <Icon 
          src={CaretRightBold} 
          className={styles.categoryIcon}
          width={20}
          height={20}
        />
      )}
    </div>
  );
};