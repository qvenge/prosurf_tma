import styles from './Trainings.module.scss';

const imgCover = "http://localhost:3845/assets/9d56337fd9fd9a92228bee24103722e0187c8172.png";
const imgMultiselectChecked = "http://localhost:3845/assets/aafa7c11b116dc581d1d62c95e5485577066b924.svg";
const imgMultiselectUnchecked = "http://localhost:3845/assets/20db19bc67f555197498ea8643efdf8c29fca4a2.svg";

export const Trainings = () => {
  return (
    <div className={styles.root}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div 
          className={styles.cover}
          style={{ backgroundImage: `url('${imgCover}')` }}
        >
          <div className={styles.pagination}>
            <div className={styles.activeDot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </div>
        <h1 className={styles.title}>Тренировки по серфингу</h1>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        {/* Month Selector */}
        <div className={styles.monthSelector}>
          <div className={styles.segmentedControl}>
            <button className={`${styles.segment} ${styles.active}`}>Июль</button>
            <button className={styles.segment}>Август</button>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Filter Chips */}
        <div className={styles.filterChips}>
          <div className={`${styles.chip} ${styles.active}`}>
            <img src={imgMultiselectChecked} alt="" className={styles.chipIcon} />
            <span>Общая группа</span>
          </div>
          <div className={styles.chip}>
            <img src={imgMultiselectUnchecked} alt="" className={styles.chipIcon} />
            <span>Tricks</span>
          </div>
          <div className={styles.chip}>
            <img src={imgMultiselectUnchecked} alt="" className={styles.chipIcon} />
            <span>Есть места</span>
          </div>
        </div>

        {/* Training Sessions */}
        <div className={styles.sessions}>
          {/* Thursday July 3 */}
          <div className={styles.sessionGroup}>
            <h2 className={styles.dateHeader}>четверг • 3 июля</h2>
            <div className={styles.sessionCards}>
              <div className={styles.sessionCard}>
                <div className={styles.cardContent}>
                  <div className={styles.timePrice}>
                    <span className={styles.time}>21:30</span>
                    <span className={styles.duration}>1 ч 30 мин.</span>
                  </div>
                  <div className={styles.sessionInfo}>
                    <h3 className={styles.sessionTitle}>Tricks 🔥</h3>
                    <p className={styles.location}>
                      Flow Moscow Ставропольская<br />
                      ул., 43, Москва
                    </p>
                  </div>
                  <span className={styles.price}>7 900 ₽</span>
                  <span className={`${styles.availability} ${styles.noSeats}`}>нет мест</span>
                </div>
              </div>
              <div className={styles.sessionCard}>
                <div className={styles.cardContent}>
                  <div className={styles.timePrice}>
                    <span className={styles.time}>22:30</span>
                  </div>
                  <div className={styles.sessionInfo}>
                    <h3 className={styles.sessionTitle}>Общая группа</h3>
                    <p className={styles.location}>
                      Flow Moscow Ставропольская<br />
                      ул., 43, Москва
                    </p>
                  </div>
                  <span className={styles.price}>7 900 ₽</span>
                  <span className={`${styles.availability} ${styles.noSeats}`}>нет мест</span>
                </div>
              </div>
            </div>
          </div>

          {/* Friday July 4 */}
          <div className={styles.sessionGroup}>
            <h2 className={styles.dateHeader}>пятница • 4 июля</h2>
            <div className={styles.sessionCards}>
              <div className={styles.sessionCard}>
                <div className={styles.cardContent}>
                  <div className={styles.timePrice}>
                    <span className={styles.time}>21:30</span>
                    <span className={styles.duration}>1 ч 30 мин.</span>
                  </div>
                  <div className={styles.sessionInfo}>
                    <h3 className={styles.sessionTitle}>Tricks 🔥</h3>
                    <p className={styles.location}>
                      Flow Moscow Ставропольская<br />
                      ул., 43, Москва
                    </p>
                  </div>
                  <span className={styles.price}>7 900 ₽</span>
                  <span className={`${styles.availability} ${styles.hasSeats}`}>3 места</span>
                </div>
              </div>
              <div className={styles.sessionCard}>
                <div className={styles.cardContent}>
                  <div className={styles.timePrice}>
                    <span className={styles.time}>22:30</span>
                  </div>
                  <div className={styles.sessionInfo}>
                    <h3 className={styles.sessionTitle}>Общая группа</h3>
                    <p className={styles.location}>
                      Flow Moscow Ставропольская<br />
                      ул., 43, Москва
                    </p>
                  </div>
                  <span className={styles.price}>7 900 ₽</span>
                  <span className={`${styles.availability} ${styles.noSeats}`}>нет мест</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monday July 7 */}
          <div className={styles.sessionGroup}>
            <h2 className={styles.dateHeader}>понедельник • 7 июля</h2>
            <div className={styles.sessionCards}>
              <div className={styles.sessionCard}>
                <div className={styles.cardContent}>
                  <div className={styles.timePrice}>
                    <span className={styles.time}>21:30</span>
                    <span className={styles.duration}>1 ч 30 мин.</span>
                  </div>
                  <div className={styles.sessionInfo}>
                    <h3 className={styles.sessionTitle}>Общая группа • Tricks 🔥</h3>
                    <p className={styles.location}>
                      Flow Moscow Ставропольская<br />
                      ул., 43, Москва
                    </p>
                  </div>
                  <span className={styles.price}>7 900 ₽</span>
                  <span className={`${styles.availability} ${styles.hasSeats}`}>3 места</span>
                </div>
              </div>
              <div className={styles.sessionCard}>
                <div className={styles.cardContent}>
                  <div className={styles.timePrice}>
                    <span className={styles.time}>22:30</span>
                  </div>
                  <div className={styles.sessionInfo}>
                    <h3 className={styles.sessionTitle}>Общая группа</h3>
                    <p className={styles.location}>
                      Flow Moscow Ставропольская<br />
                      ул., 43, Москва
                    </p>
                  </div>
                  <span className={styles.price}>7 900 ₽</span>
                  <span className={`${styles.availability} ${styles.noSeats}`}>нет мест</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};