import { Icon } from '@/shared/ui/icon';
import { CaretRightBold } from '@/shared/ds/icons';
import { type EventSession } from '@/shared/api';
import styles from './CategoryItem.module.scss';

interface CategoryItemProps {
  title: string;
  imageUrl: string;
  nextSession: EventSession | null;
  isLoading: boolean;
  error: boolean;
  formatUpcomingDate: (dateString: string) => string;
}

export const CategoryItem = ({
  title,
  imageUrl,
  nextSession,
  isLoading,
  error,
  formatUpcomingDate
}: CategoryItemProps) => {
  return (
    <div className={`${styles.categoryItem} ${!nextSession && !isLoading && !error ? styles.categoryItemDisabled : ''}`}>
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