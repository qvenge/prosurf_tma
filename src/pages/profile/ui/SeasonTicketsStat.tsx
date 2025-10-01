import { useCurrentUserSeasonTickets } from '@/shared/api/hooks/season-tickets';
import styles from './Profile.module.scss';

export const SeasonTicketsStat = () => {
  const { data: seasonTicketsData, isLoading } = useCurrentUserSeasonTickets();

  // Calculate total remaining passes from all active season tickets
  const totalRemainingPasses = seasonTicketsData
    ? seasonTicketsData
        .filter((ticket) => ticket.status === 'ACTIVE')
        .reduce((sum, ticket) => sum + ticket.remainingPasses, 0)
    : 0;

  return (
    <div className={styles.statItemContent}>
      <div className={styles.statLabel}>Абонемент</div>
      <div className={styles.statValue}>
        {isLoading ? '...' : totalRemainingPasses}
      </div>
    </div>
  );
};
