import clsx from 'clsx';
import type { SeasonTicketPlan } from '@/shared/api';
import styles from './SeasonTicketPlans.module.scss';

interface SeasonTicketPlansProps {
  plans: SeasonTicketPlan[];
  selectedPlanId: string;
  onPlanSelect: (planId: string) => void;
}

export function SeasonTicketPlans({ plans, selectedPlanId, onPlanSelect }: SeasonTicketPlansProps) {
  return (
    <div className={styles.productSettings}>
      <div className={styles.amountList}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={clsx(styles.amountItem, plan.id === selectedPlanId && styles['amountItem--active'])}
            onClick={() => onPlanSelect(plan.id)}
          >
            <div className={styles.amountNumber}>{plan.passes}</div>
            <div className={styles.amountText}>Занятий</div>
          </div>
        ))}
      </div>
    </div>
  );
}