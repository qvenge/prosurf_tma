import { SessionCard } from '../session-card';
import styles from './SessionGroup.module.scss';
import type { SessionGroup as SessionGroupProps } from '@/shared/lib/hooks/use-session-groups';

export type { SessionGroupProps };

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