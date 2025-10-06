import { PageLayout } from '@/widgets/page-layout'
import { useImages } from '@/shared/api';
import styles from './Home.module.scss';
import { TrainingCategories } from '@/features/trainings';

import { HorizontalBookingList } from './HorizontalBookingList';
import { TourActivityList } from './TourActivityList';

export const HomePage = () => {
  const { data: images } = useImages({"tags.any": ['home']});
  const heroImages = images?.items.map(item => item.url) ?? [];

  return (
    <PageLayout heroImages={heroImages}>
      <div className={styles.wrapper}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Мои записи</h2>
          <HorizontalBookingList />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Тренировки</h2>
          <TrainingCategories className={styles.trainingCategories} />
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Туры и ивенты</h2>
          <TourActivityList />
        </div>
      </div>
    </PageLayout>
  );
};