import { SessionGroup, type SessionGroupProps } from '../session-group';
import styles from './SessionList.module.scss';
import { EmptyListStub, Spinner } from '@/shared/ui';

interface SessionListProps {
  sessionGroups: SessionGroupProps[];
  isLoading: boolean;
  error: any;
}

export const SessionList = ({ sessionGroups, isLoading, error }: SessionListProps) => {
  if (isLoading) {
    return (
      <div className={styles.stub}>
        <Spinner size="l" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.stub}>
        <div>Ошибка загрузки тренировок</div>
      </div>
    );
  }

  if (sessionGroups.length === 0) {
    return (
      <div className={styles.stub}>
        <EmptyListStub message='Тренировки не найдены' />
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