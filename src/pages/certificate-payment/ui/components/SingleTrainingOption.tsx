import styles from './SingleTrainingOption.module.scss';

export function SingleTrainingOption() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardInfo}>
          <div className={styles.cardTitle}>Сертификат</div>
          <div className={styles.cardSubtitle}>Разовая тренировка по серфингу</div>
        </div>
        <div className={styles.cardPrice}>7 900 ₽</div>
      </div>
    </div>
  );
}
