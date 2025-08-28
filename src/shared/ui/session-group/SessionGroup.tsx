import { SessionCard, type SessionCardProps } from '@/shared/ui/session-card';
import styles from './SessionGroup.module.scss';

export interface SessionGroupProps {
  dateHeader: string;
  sessions: SessionCardProps[];
}

export const SessionGroup = ({ dateHeader, sessions }: SessionGroupProps) => {
  return (
    <div className={styles.sessionGroup}>
      <h2 className={styles.dateHeader}>{dateHeader}</h2>
      <div className={styles.sessionCards}>
        {sessions.map((session, index) => (
          <SessionCard key={index} {...session} />
        ))}
      </div>
    </div>
  );
};