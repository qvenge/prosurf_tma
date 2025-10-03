import { Link } from '@/shared/navigation';
import { Icon, Button } from '@/shared/ui';
import { CheckCircleFill } from '@/shared/ds/icons';
import styles from './PaymentSuccessPage.module.scss';
import { useSearchParams } from 'react-router';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  // season-ticket | training | activity | tour
  const type = searchParams.get('type');

  let title = 'Оплачено';
  let description = null;
  let primaryButton = null;
  let secondaryButton = {text: 'На главную', link: '/'};

  switch (type) {
    case 'training': {
      title = 'Вы записались на тренировку!';
      description = 'Напоминаем что отмена записи возможна не позднее чем за 24 часа';
      primaryButton = {text: 'В мои записи', link: '/profile/bookings'};
      break;
    }
    case 'activity': {
      title = 'Вы записались на ивент!';
      description = 'Напоминаем что отмена записи возможна не позднее чем за 24 часа';
      primaryButton = {text: 'В мои записи', link: '/profile/bookings'};
      break;
    }
    case 'tour': {
      title = 'Вы записались в тур!';
      description = 'Напоминаем что отмена записи возможна не позднее чем за 24 часа';
      primaryButton = {text: 'В мои записи', link: '/profile/bookings'};
      break;
    }
  }

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
          <Link to={primaryButton.link} tab="profile" reset={true}>
            <Button className={styles.primaryButton} size='m' mode='secondary'>{primaryButton.text}</Button>
          </Link>
        )}
        {secondaryButton && (
          <Link to={secondaryButton.link} tab="home" reset={true}>
            <Button className={styles.secondaryButton} size='m' mode='primary'>{secondaryButton.text}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}