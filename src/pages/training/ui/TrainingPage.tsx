import clsx from 'clsx';

import { ImageSlider, Icon } from '@/shared/ui';
import { CalendarBlankBold, MapPinRegular } from '@/shared/ds/icons';
import styles from './TrainingPage.module.scss';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];

// Assets from Figma
const imgRectangle3 = "http://localhost:3845/assets/c13e3ca0ccd2db8f8894d5a02d936feb0dea78c3.png";

export const TrainingPage = () => {
  const eventTitle = 'Общая группа • Tricks 🔥';

  return (
    <div className={styles.wrapper}>
      {/* Hero Section with Image and Training Info */}
      <div className={clsx(styles.wrapperItem, styles.heroSection)}>
        <ImageSlider 
          images={heroImages}
          className={styles.imageSlider}
        />

        <h1 className={styles.title}>{eventTitle}</h1>

        <div className={styles.info}>
          <div className={styles.priceInfo}>
            <div className={styles.priceDetails}>
              <div className={styles.priceType}>Разовая тренировка</div>
              <div className={styles.price}>7 900 ₽</div>
            </div>
            <div className={styles.spotsRemaining}>Осталось 3 места</div>
          </div>

          <div className={styles.dateInfo}>
            <Icon
              className={styles.calendarIcon}
              src={CalendarBlankBold}
              width={16}
              height={16}
            />
            <div className={styles.dateText}>4 июля • Пт</div>
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
                Flow Moscow Ставропольская, ул. 43, Москва
              </div>
            </div>
          </div>
          <div className={styles.locationTimeRight}>
            <div className={styles.duration}>1 ч 30 мин.</div>
            <div className={styles.time}>21:30</div>
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

      {/* Description */}
      <div className={clsx(styles.wrapperItem, styles.descriptionSection)}>
        <div className={styles.sectionTitle}>Описание тренировки</div>
        <div className={styles.descriptionText}>
          Новый формат тренировки для эффективной отработки трюков: - Заезды по 15 сек - Больше попыток - быстрее прогресс - Разбираем трюк на суше - Отрабатываем его на волне Ты не будешь осторожничать, так как попыток будет ооочень много. Быстрее освоишь новые трюки и застабилишь старые.
        </div>
      </div>

      {/* Equipment */}
      <div className={clsx(styles.wrapperItem, styles.descriptionSection)}>
        <div className={styles.sectionTitle}>Что с собой?</div>
        <div className={styles.descriptionText}>
          Новый формат тренировки для эффективной отработки трюков: - Заезды по 15 сек - Больше попыток - быстрее прогресс - Разбираем трюк на суше - Отрабатываем его на волне Ты не будешь осторожничать, так как попыток будет ооочень много. Быстрее освоишь новые трюки и застабилишь старые.
        </div>
      </div>
    </div>
  );
};