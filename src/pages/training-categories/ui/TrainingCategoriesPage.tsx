import { TrainingCategories } from '@/features/trainings';
import styles from './TrainingCategoriesPage.module.scss';

export const TrainingCategoriesPage = () => {

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h1 className={styles.title}>Тренировки</h1>
        <TrainingCategories className={styles.categories} />
      </div>
    </div>
  );
};