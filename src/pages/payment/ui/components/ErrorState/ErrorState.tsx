import styles from './ErrorState.module.scss';

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message = 'Произошла ошибка' }: ErrorStateProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.error}>{message}</div>
    </div>
  );
}