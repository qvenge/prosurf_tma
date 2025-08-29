import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { ImageSlider, Icon, Button, useBottomBar } from '@/shared/ui';
import { CalendarBlankBold, MapPinRegular } from '@/shared/ds/icons';
import { useEventSession } from '@/shared/api/hooks/use-event-sessions';
import styles from './TrainingPage.module.scss';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];

// Assets from Figma
const imgRectangle3 = "http://localhost:3845/assets/c13e3ca0ccd2db8f8894d5a02d936feb0dea78c3.png";

export const TrainingPage = () => {
  const { setOverride } = useBottomBar();
  const { trainingId } = useParams<{ trainingId: string; }>();
  const { data: session, isLoading, error } = useEventSession(trainingId!);

  const bookingButton = useMemo(() => (
    <div className={styles.bookingButtonWrapper}>
      <Button
        size='l'
        mode='filled'
        stretched={true}
      >
        Записаться
      </Button>
    </div>
  ), []);

  useEffect(() => {
    setOverride(bookingButton);
    return () => setOverride(null);
  }, [setOverride, bookingButton]);

  if (isLoading) {
    return <div className={styles.wrapper}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.wrapper}>Error loading training session</div>;
  }

  if (!session) {
    return <div className={styles.wrapper}>Training session not found</div>;
  }

  return (
    <div className={styles.wrapper}>
      {/* Hero Section with Image and Training Info */}
      <div className={clsx(styles.wrapperItem, styles.heroSection)}>
        <ImageSlider 
          images={heroImages}
          className={styles.imageSlider}
        />

        <h1 className={styles.title}>{session.title}</h1>

        <div className={styles.info}>
          <div className={styles.priceInfo}>
            <div className={styles.priceDetails}>
              <div className={styles.priceType}>Разовая тренировка</div>
              <div className={styles.price}>{session.price.amount} {session.price.currency === 'RUB' ? '₽' : '$'}</div>
            </div>
            <div className={styles.spotsRemaining}>Осталось {session.remainingSeats} мест</div>
          </div>

          <div className={styles.dateInfo}>
            <Icon
              className={styles.calendarIcon}
              src={CalendarBlankBold}
              width={16}
              height={16}
            />
            <div className={styles.dateText}>
              {new Date(session.start).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                weekday: 'short'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className={clsx(styles.wrapperItem, styles.contentSection)}>
        {/* Location and Time */}
        <div className={styles.locationTime}>
          <div className={styles.locationTimeLeft}>
            <div className={styles.sectionTitle}>Место и время</div>
            <div className={styles.locationInfo}>
              <Icon
                className={styles.mapIcon}
                width={20}
                height={20}
                src={MapPinRegular}
              />
              <div className={styles.address}>
                {session.location}
              </div>
            </div>
          </div>
          <div className={styles.locationTimeRight}>
            <div className={styles.duration}>1 ч 30 мин.</div>
            <div className={styles.time}>
              {new Date(session.start).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Map */}
        <div 
          className={styles.mapImage}
          style={{
            backgroundImage: `url('${imgRectangle3}')`
          }}
        />
      </div>

      {/* Description Sections */}
      {session.description.map((section, index) => (
        <div key={index} className={clsx(styles.wrapperItem, styles.descriptionSection)}>
          <div className={styles.sectionTitle}>{section.heading}</div>
          <div className={styles.descriptionText}>
            {section.body}
          </div>
        </div>
      ))}
    </div>
  );
};