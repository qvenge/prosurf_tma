import { Link } from '@/shared/navigation';
import { Icon, Button } from '@/shared/ui';
import { CheckCircleFill } from '@/shared/ds/icons';
import styles from './PaymentSuccessPage.module.scss';
import { useSearchParams } from 'react-router';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  //type=season-ticket
  //type=training
  //type=session
  const type = searchParams.get('type');

  const title = type === 'training' ? 'Вы записались на тренировку!' : 'Оплачено';
  const description = type === 'training' ? 'Напоминаем что отмена записи возможна не позднее чем за 24 часа' : null;
  const primaryButton = type === 'training' ? {text: 'В мои записи', link: '/profile'} : null;
  const secondaryButton = {text: 'На главную', link: '/'};

  return (
    <div className={styles.wrapper}>
      <Icon
        className={styles.icon}
        src={CheckCircleFill}
        width={48}
        height={48}
      />
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {description && (
          <div className={styles.description}>{description}</div>
        )}
      </div>
      <div className={styles.controls}>
        {primaryButton && (
          <Link to={primaryButton.link}>
            <Button className={styles.primaryButton} size='m' mode='secondary'>{primaryButton.text}</Button>
          </Link>
        )}
        {secondaryButton && (
          <Link to={secondaryButton.link} tab={{ value: 'home', reset: true }}>
            <Button className={styles.secondaryButton} size='m' mode='primary'>{secondaryButton.text}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}