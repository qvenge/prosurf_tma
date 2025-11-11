import { useMemo } from 'react';
import { PageLayout } from '@/widgets/page-layout'
import { useImages, useBookings, type BookingFilters } from '@/shared/api';
import { SESSION_START_DATE } from '@/shared/lib/date-utils';
import styles from './Home.module.scss';
import { TrainingCategories } from '@/features/trainings';

import { HorizontalBookingList } from './HorizontalBookingList';
import { TourActivityList } from './TourActivityList';

export const HomePage = () => {
  const { data: images } = useImages({"tags.any": ['home']});
  const heroImages = images?.items.map(item => item.url) ?? [];

  const bookingFilters: BookingFilters = useMemo(() => ({
    status: ['CONFIRMED'],
    includeSession: true,
    limit: 50,
    startsAfter: SESSION_START_DATE,
    sortBy: 'startsAt',
    sortOrder: 'asc'
  }), []);

  const { data: bookingsData, isLoading: isBookingsLoading } = useBookings(bookingFilters);
  const hasBookings = !isBookingsLoading && bookingsData?.items && bookingsData.items.length > 0;

  return (
    <PageLayout heroImages={heroImages}>
      <div className={styles.wrapper}>
        {hasBookings && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Мои записи</h2>
            <HorizontalBookingList data={bookingsData} isLoading={isBookingsLoading} />
          </div>
        )}

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