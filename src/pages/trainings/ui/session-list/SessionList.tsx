import { SessionGroup, type SessionGroupProps } from '../session-group';
import styles from './SessionList.module.scss';

interface SessionListProps {
  sessionGroups: SessionGroupProps[];
  isLoading: boolean;
  error: any;
}

export const SessionList = ({ sessionGroups, isLoading, error }: SessionListProps) => {
  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        Загрузка тренировок...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        Ошибка загрузки тренировок
      </div>
    );
  }

  if (sessionGroups.length === 0) {
    return (
      <div className={styles.emptyState}>
        Тренировки не найдены
      </div>
    );
  }

  return (
    <>
      {sessionGroups.map((group, index) => (
        <SessionGroup
          key={index}
          dateHeader={group.dateHeader}
          sessions={group.sessions}
        />
      ))}
    </>
  );
};