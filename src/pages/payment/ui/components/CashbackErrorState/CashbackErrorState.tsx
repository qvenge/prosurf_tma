import { ERROR_MESSAGES } from '../../../lib/constants';
import styles from './CashbackErrorState.module.scss';

interface CashbackErrorStateProps {
  message?: string;
}

export function CashbackErrorState({
  message = ERROR_MESSAGES.CASHBACK_LOADING_ERROR
}: CashbackErrorStateProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>⚠️</span>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
