import { TrainingCategories } from '@/features/trainings';
import { PageLayout } from '@/widgets/page-layout';
import styles from './TrainingCategoriesPage.module.scss';

export const TrainingCategoriesPage = () => {

  return (
    <PageLayout title='Тренировки'>
      <div className={styles.wrapper}>
        <TrainingCategories className={styles.categories} />
      </div>
    </PageLayout>
  );
};