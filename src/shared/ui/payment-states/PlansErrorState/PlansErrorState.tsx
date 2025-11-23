import { Button } from '@/shared/ui/button';
import { PLANS_ERRORS } from '@/shared/lib/payment';
import styles from './PlansErrorState.module.scss';

interface PlansErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export function PlansErrorState({
  onRetry,
  message = PLANS_ERRORS.PLANS_LOADING_ERROR
}: PlansErrorStateProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.icon}>⚠️</div>
        <div className={styles.message}>{message}</div>
        <Button
          mode="secondary"
          size="m"
          onClick={onRetry}
          className={styles.button}
        >
          Повторить попытку
        </Button>
      </div>
    </div>
  );
}
