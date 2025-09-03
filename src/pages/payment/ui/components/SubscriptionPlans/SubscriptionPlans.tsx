import clsx from 'clsx';
import styles from './SubscriptionPlans.module.scss';

interface SubscriptionPlan {
  id: string;
  name: string;
  sessionsTotal: number;
  priceMinor: number;
}

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  selectedPlanId: string;
  onPlanSelect: (planId: string) => void;
}

export function SubscriptionPlans({ plans, selectedPlanId, onPlanSelect }: SubscriptionPlansProps) {
  return (
    <div className={styles.productSettings}>
      <div className={styles.amountList}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={clsx(styles.amountItem, plan.id === selectedPlanId && styles['amountItem--active'])}
            onClick={() => onPlanSelect(plan.id)}
          >
            <div className={styles.amountNumber}>{plan.sessionsTotal}</div>
            <div className={styles.amountText}>Занятий</div>
          </div>
        ))}
      </div>
    </div>
  );
}