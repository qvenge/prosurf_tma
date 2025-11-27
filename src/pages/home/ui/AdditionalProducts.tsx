import { Button } from '@/shared/ui';
import { Link } from '@/shared/navigation';
import { useSeasonTicketPlans } from '@/shared/api';
import { formatPrice } from '@/shared/lib/format-utils';
import styles from './AdditionalProducts.module.scss';

export function AdditionalProducts() {
  const { data: seasonTicketPlans, isLoading: isLoadingSeasonTicketPlans } = useSeasonTicketPlans();
  const plans = seasonTicketPlans?.items || [];
  const chipestPlan = plans.length > 0 ? plans.reduce(
    (min, plan) => plan.price.amountMinor < min.price.amountMinor ? plan : min,
    plans[0]
  ) : null;
  
  return (
    <div className={styles.wrapper}>

      <div className={styles.product}>
        <div className={styles.header}>
          <div className={styles.info}>
            <div className={styles.name}>Абонементы</div>
            <div className={styles.type}>Серфинг</div>
          </div>
          {!isLoadingSeasonTicketPlans && chipestPlan
            ? <div className={styles.price}>от {formatPrice(chipestPlan.price)}</div>
            : 'Загрузка...'
          }
        </div>
        <Link to="/profile/season-tickets" tab="profile" className={styles.link}>
          <Button className={styles.button} mode="secondary" size="l" stretched>
            Купить
          </Button>
        </Link>
      </div>

      <div className={styles.product}>
        <div className={styles.header}>
          <div className={styles.info}>
            <div className={styles.name}>Сертификаты</div>
          </div>
          <div className={styles.price}>от 3 000 ₽</div>
        </div>
        <Link to="/profile/certificates" tab="profile" className={styles.link}>
          <Button className={styles.button} mode="secondary" size="l" stretched>
            Купить
          </Button>
        </Link>
      </div>
    </div>
  );
}