import { useMemo } from 'react';
import { PageLayout } from '@/widgets/page-layout'
import { useImages, useBookings, useContentsByKeys, type BookingFilters } from '@/shared/api';
import { ImageSlider, MarkdownRenderer } from '@/shared/ui';
import { SESSION_START_DATE } from '@/shared/lib/date-utils';
import styles from './Home.module.scss';
import { TrainingCategories } from '@/features/trainings';

import { HorizontalBookingList } from './HorizontalBookingList';
import { TourActivityList } from './TourActivityList';
import { AdditionalProducts } from './AdditionalProducts';

export const HomePage = () => {
  const { data: _heroImages } = useImages({"tags.any": ['home']});
  const heroImages = _heroImages?.items.map(item => item.url) ?? [];

  const { data: _aboutImages } = useImages({"tags.any": ['about']});
  const aboutImages = _aboutImages?.items.map(item => item.url) ?? [];

  const { data: homeContents } = useContentsByKeys(['home.about', 'home.whatWeDo']);
  const contentMap = useMemo(() => {
    if (!homeContents) return {};
    return Object.fromEntries(homeContents.map(c => [c.key, c]));
  }, [homeContents]);

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

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Абонементы и сертификаты</h2>
          <AdditionalProducts />
        </div>

        <div className={styles.aboutImages}>
          <ImageSlider images={aboutImages} style={{borderRadius: 16}}/>
        </div>

        {contentMap['home.about'] && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{contentMap['home.about'].title}</h2>
            <MarkdownRenderer content={contentMap['home.about'].content} className={styles.aboutText} />
          </div>
        )}

        {contentMap['home.whatWeDo'] && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{contentMap['home.whatWeDo'].title}</h2>
            <MarkdownRenderer content={contentMap['home.whatWeDo'].content} className={styles.aboutText} />
          </div>
        )}
      </div>
    </PageLayout>
  );
};
