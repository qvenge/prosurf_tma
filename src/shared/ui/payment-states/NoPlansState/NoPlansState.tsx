import styles from './NoPlansState.module.scss';

export function NoPlansState() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.message}>
          Нет доступных планов абонементов для этой тренировки
        </div>
        <div className={styles.hint}>
          Вы можете оплатить разовую тренировку
        </div>
      </div>
    </div>
  );
}
