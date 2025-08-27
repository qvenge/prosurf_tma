import styles from './Home.module.scss';

// import coverImageSrc from 'images.jpg';
const coverImageSrc = '/images/surfing1.jpg'

export function Home() {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.coverSection}>
          <div className={styles.coverImage} style={{ backgroundImage: `url(${coverImageSrc})` }}>
            <div className={styles.pagination}>
              <div className={styles.activeDot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Мои записи</h2>
          <div className={styles.bookingCards}>
            <div className={styles.bookingCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>🏄</div>
                <div className={styles.cardLabel}>Серфинг</div>
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardLocation}>Flow Moscow • Общая группа</div>
                <div className={styles.cardTime}>Пт • 4 июля в 21:30</div>
              </div>
            </div>
            <div className={styles.bookingCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>🏄</div>
                <div className={styles.cardLabel}>Серфинг</div>
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardLocation}>Flow Moscow • Общая группа</div>
                <div className={styles.cardTime}>Пт • 4 июля в 21:30</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Тренировки</h2>
          <div className={styles.workoutCards}>
            <div className={styles.workoutCard}>
              <div className={styles.workoutImage}></div>
              <div className={styles.workoutInfo}>
                <h3>Серфинг</h3>
                <p>Ближайшая: 4 июля в 21:30</p>
              </div>
              <div className={styles.chevron}>›</div>
            </div>
            <div className={styles.workoutCard}>
              <div className={styles.workoutImage}></div>
              <div className={styles.workoutInfo}>
                <h3>Серфскейт</h3>
                <p>Ближайшая: 4 июля в 21:30</p>
              </div>
              <div className={styles.chevron}>›</div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Туры и ивены</h2>
          <div className={styles.eventCards}>
            <div className={styles.eventCard}>
              <div className={styles.eventImage}></div>
              <div className={styles.eventInfo}>
                <div className={styles.eventDate}>1 мая – 6 июня</div>
                <h3>ProSurf Camp / Bali</h3>
                <div className={styles.eventLocation}>Бали, Индонезия</div>
                <div className={styles.eventPrice}>$ 1 690</div>
              </div>
              <div className={styles.eventYear}>2025 г</div>
              <div className={styles.eventSpots}>3 места</div>
            </div>
            <div className={styles.eventCard}>
              <div className={styles.eventImage}></div>
              <div className={styles.eventInfo}>
                <div className={styles.eventDate}>1 мая – 6 июня</div>
                <h3>ProSurf Camp / Bali</h3>
                <div className={styles.eventLocation}>Бали, Индонезия</div>
                <div className={styles.eventPrice}>$ 1 690</div>
              </div>
              <div className={styles.eventYear}>2025 г</div>
              <div className={styles.eventSpots}>нет мест</div>
            </div>
            <div className={styles.eventCardCompact}>
              <div className={styles.eventInfo}>
                <h3>SurfSkate Встреча</h3>
                <div className={styles.eventLocation}>Flow Moscow Ставропольская ул., 43, Москва</div>
                <div className={styles.eventPrice}>2 000 ₽</div>
              </div>
              <div className={styles.eventTime}>21:30</div>
              <div className={styles.eventSpots}>3 места</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}