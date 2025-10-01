import styles from './MySeasonTicketsPage.module.scss';
import { PageLayout } from '@/widgets/page-layout';
import { useCurrentUserSeasonTickets, useSeasonTicketPlans } from '@/shared/api';
import { Button } from '@/shared/ui';
import { pluralize } from '@/shared/lib/string';
import { formatPrice } from '@/shared/lib/format-utils';
import { EmptyListStub } from '@/shared/ui';
import { useNavigate } from '@/shared/navigation';

export function MySeasonTicketsPage() {
  const { data: seasonTickets = [] } = useCurrentUserSeasonTickets();
  const { data: plansResponse } = useSeasonTicketPlans();
  const navigate = useNavigate();
  const plans = plansResponse?.items ?? [];

  return (
    <PageLayout title="Абонемент">
      <div className={styles.wrapper}>
        {seasonTickets.length > 0 && (
          <div className={styles.tickets}>{seasonTickets.map((ticket) => (
            <div className={styles.card}>
              <div className={styles.ticketHeader}>
                <div className={styles.ticketTitle}>Осталось занятий</div>
                <div className={styles.ticketPasses}>{ticket.remainingPasses}</div>
              </div>
              <div className={styles.cardDivider} />
              <div className={styles.ticketFooter}>
                <div className={styles.ticketExpiration}>
                  <div className={styles.ticketExpirationDate}>{new Date(ticket.validUntil).toLocaleDateString()}</div>
                  <div className={styles.ticketExpirationHint}>Срок действия</div>
                </div>
                <div className={styles.ticketId}>ID: {ticket.id}</div>
              </div>
            </div>
          ))}</div>
        )}

        {plans.length > 0 && (
          <div className={styles.plans}>
            <h2 className={styles.plansTitle}>Предложения по абонементам</h2>
            {plans.map((plan) => (
              <div key={plan.id} className={styles.card}>
                <div className={styles.planHeader}>
                  <div className={styles.planInfo}>
                    <div className={styles.planName}>Абонемент {plan.passes} {pluralize(plan.passes, ['занятие', 'занятия', 'занятий'])}</div>
                    <div className={styles.planDescription}>{plan.description}</div>
                  </div>
                  <div className={styles.planDetails}>
                    <div className={styles.planPrice}>{formatPrice(plan.price)}</div>
                    <div className={styles.planPricePerPass}>{formatPrice({
                      amountMinor: Math.floor(plan.price.amountMinor / plan.passes),
                      currency: plan.price.currency
                    })} / занятие</div>
                  </div>
                </div>
                <div className={styles.cardDivider} />
                <Button
                  className={styles.planButton}
                  mode='secondary'
                  size='m'
                  stretched={true}
                  onClick={() => navigate(`/season-tickets/${plan.id}/payment`)}
                >
                  Купить
                </Button>
              </div>
            ))}
          </div>
        )}

        {seasonTickets.length === 0 && plans.length === 0 && (
          <div className={styles.stub}>
            <EmptyListStub message="Пока нет абонементов" />
          </div>
        )}
      </div>
    </PageLayout>
  );
}