import { Icon } from '@/shared/ui/icon';
import { CaretRightBold } from '@/shared/ds/icons';
import styles from './TrainingCategories.module.scss';

export const TrainingCategories = () => {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h1 className={styles.title}>Тренировки</h1>
        <div className={styles.categories}>
          <div className={styles.categoryList}>
            <div className={styles.categoryItem}>
              <div 
                className={styles.categoryImage}
                style={{ backgroundImage: 'url(/images/surfing1.jpg)' }}
              />
              <div className={styles.categoryContent}>
                <h2 className={styles.categoryTitle}>Серфинг</h2>
                <p className={styles.categorySchedule}>Ближайшая: 4 июля в 21:30</p>
              </div>
              <Icon 
                src={CaretRightBold} 
                className={styles.categoryIcon}
                width={20}
                height={20}
              />
            </div>
            <div className={styles.categoryItem}>
              <div 
                className={styles.categoryImage}
                style={{ backgroundImage: 'url(/images/surfskate1.png)' }}
              />
              <div className={styles.categoryContent}>
                <h2 className={styles.categoryTitle}>Серфскейт</h2>
                <p className={styles.categorySchedule}>Ближайшая: 4 июля в 21:30</p>
              </div>
              <Icon 
                src={CaretRightBold} 
                className={styles.categoryIcon}
                width={20}
                height={20}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};