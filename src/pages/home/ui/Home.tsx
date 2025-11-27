import { useMemo } from 'react';
import { PageLayout } from '@/widgets/page-layout'
import { useImages, useBookings, type BookingFilters } from '@/shared/api';
import { ImageSlider } from '@/shared/ui';
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

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>О нас</h2>
          <p className={styles.aboutText}>
            Мы серф-комьюнити классных людей,
            которые вместе тренируются, веселятся, тусуются, путешествуют и просто любят сильно жизнь!
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Что мы делаем?</h2>
          <p className={styles.aboutText}>
            🤙Крутейшие тренировки по сёрфингу на искусственной волне.<br />
            🤙Тренировки на серф-скейтах! Супер классная тема для тех кто хочет прокачать серф стиль<br />
            🤙Мы создаём события для вас! Это неотъемлемая часть нашей жизни!<br />
            🤙Конечно же мы делаем туры. Катаемся везде где можно серфить!<br />
            <br />
            В основе нашего комьюнити люди! Мы любим каждого и будем рады всем! Оставайся с нами!
          </p>
        </div>
      </div>
    </PageLayout>
  );
};