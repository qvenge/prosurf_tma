import { BONUS_ERRORS } from '@/shared/lib/payment';
import styles from './BonusErrorState.module.scss';

interface BonusErrorStateProps {
  message?: string;
}

export function BonusErrorState({
  message = BONUS_ERRORS.BONUS_LOADING_ERROR
}: BonusErrorStateProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>⚠️</span>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
