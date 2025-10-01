import styles from './MySeasonTicketsPage.module.scss';
import { PageLayout } from '@/widgets/page-layout';
import { type SeasonTicket, type SeasonTicketPlan } from '@/shared/api';
import { Button } from '@/shared/ui';
import { pluralize } from '@/shared/lib/string';
import { formatPrice } from '@/shared/lib/format-utils';
import { EmptyListStub } from '@/shared/ui';

export function MySeasonTicketsPage() {
  const seasonTickets: SeasonTicket[] = [{
    id: '123456789',
    userId: 'user_001',
    status: 'ACTIVE',
    remainingPasses: 5,
    validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    planId: 'plan_001',
  }];

  const plans: SeasonTicketPlan[] = [{
    id: 'plan_001',
    name: 'Абонемент на 1 месяц',
    description: 'Серфинг',
    price: { amountMinor: 500000, currency: 'RUB' },
    passes: 10,
  }];

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