import { Link } from '@/shared/navigation';
import { Button } from '@/shared/ui';

import styles from './ErrorFallback.module.scss';

interface ErrorFallbackProps {
  message: string;
}

export function ErrorFallback({ message }: ErrorFallbackProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" />
            <path
              d="M32 20V36"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="32" cy="44" r="2" fill="currentColor" />
          </svg>
        </div>

        <h1 className={styles.title}>Что-то пошло не так</h1>

        <p className={styles.message}>{message}</p>

        {/* {canRetry && onRetry && (
          <Button
            stretched
            size="l"
            mode="primary"
            onClick={onRetry}
          >
            Попробовать снова
          </Button>
        )} */}

      <div className={styles.controls}>
        <Link to={'/'} tab="home" reset={true}>
          <Button className={styles.primaryButton} size='m' mode='secondary'>На главную</Button>
        </Link>
        <Button
          className={styles.secondaryButton}
          size='m'
          mode='primary'
          onClick={() => window.location.reload()}
        >
          Перезагрузить
        </Button>
      </div>
      </div>
    </div>
  );
}
