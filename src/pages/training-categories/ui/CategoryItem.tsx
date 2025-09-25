import { useNavigate } from '@/shared/navigation';
import { Icon } from '@/shared/ui/icon';
import { CaretRightBold } from '@/shared/ds/icons';
import { useSessions, type EventType } from '@/shared/api';
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
  eventType: EventType;
}

export const CategoryItem = ({
  title,
  imageUrl,
  eventType
}: CategoryItemProps) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSessions({
    'labels.any': [eventType],
    limit: 1
  });

  const nextSession = data && data.items && data.items.length > 0 ? data.items[0] : null;

  const handleClick = () => {
    if (nextSession && !isLoading && !error) {
      const categorySlug = eventType === 'training:surfing' ? 'surfing' : 'surfskate';
      navigate(`/trainings/categories/${categorySlug}`);
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
              `Ближайшая: ${formatUpcomingDate(nextSession.startsAt)}` : 
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