import { Link } from '@/shared/navigation';
import { Icon, Button } from '@/shared/ui';
import { CheckCircleFill } from '@/shared/ds/icons';
import styles from './PaymentSuccessPage.module.scss';

export function PaymentSuccessPage() {
  return (
    <div className={styles.wrapper}>
      <Icon
        className={styles.icon}
        src={CheckCircleFill}
        width={48}
        height={48}
      />
      <div className={styles.content}>
        <h1 className={styles.title}>Вы записались на серф-тренировку!</h1>
        <div className={styles.description}>
          Напоминаем что отмена записи возможна не позднее чем за 24 часа
        </div>
      </div>
      <div className={styles.controls}>
        <Link to='/profile'>
          <Button className={styles.toEntriesBtn} size='m' mode='secondary'>В мои записи</Button>
        </Link>
        <Link to='/'>
          <Button className={styles.toEntriesBtn} size='m' mode='primary'>На главную</Button>
        </Link>
      </div>
    </div>
  );
}