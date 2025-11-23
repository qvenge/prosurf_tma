import { CASHBACK_ERRORS } from '@/shared/lib/payment';
import styles from './CashbackErrorState.module.scss';

interface CashbackErrorStateProps {
  message?: string;
}

export function CashbackErrorState({
  message = CASHBACK_ERRORS.CASHBACK_LOADING_ERROR
}: CashbackErrorStateProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>⚠️</span>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
