import styles from './LoadingState.module.scss';

export function LoadingState() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.loading}>Загрузка...</div>
    </div>
  );
}