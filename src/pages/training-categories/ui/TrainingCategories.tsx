import { CategoryItem } from './CategoryItem';
import styles from './TrainingCategories.module.scss';

export const TrainingCategories = () => {

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h1 className={styles.title}>Тренировки</h1>
        <div className={styles.categories}>
          <div className={styles.categoryList}>
            <CategoryItem
              title="Серфинг"
              imageUrl="/images/surfing1.jpg"
              trainingLabel="surfingTraining"
            />
            <CategoryItem
              title="Серфскейт"
              imageUrl="/images/surfskate1.png"
              trainingLabel="surfskateTraining"
            />
          </div>
        </div>
      </div>
    </div>
  );
};