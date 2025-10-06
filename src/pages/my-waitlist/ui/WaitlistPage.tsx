import { useState } from 'react';
import { SegmentedControl, InfiniteScrollList } from '@/shared/ui'
import { PageLayout } from '@/widgets/page-layout'
import { useSessionsInfinite, type Session } from '@/shared/api'
import { formatSessionDate, formatTime, SESSION_START_DATE } from '@/shared/lib/date-utils'
import styles from './WaitlistPage.module.scss';
import { SessionCard, type SessionCardProps } from './SessionCard';

const transformSessionToCardData = (session: Session): SessionCardProps['data'] => {
  const formatSessionDurationOrYear = (startsAt?: string, endsAt?: string | null): string | undefined => {
    if (!startsAt || !endsAt) return undefined;
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return undefined;
    const diff = end.getTime() - start.getTime();
    if (diff < 0) return undefined;
    const DAY_MS = 24 * 60 * 60 * 1000;
    if (diff < DAY_MS) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const minutes = Math.round((diff % (60 * 60 * 1000)) / (60 * 1000));
      const parts: string[] = [];
      if (hours) parts.push(`${hours} ч`);
      if (minutes) parts.push(`${minutes} мин`);
      return parts.length ? parts.join(' ') : '0 мин';
    }
    return `${start.getFullYear()} г`;
  };

  const rightBottomInner = formatSessionDurationOrYear(session.startsAt, session.endsAt);

  return {
    id: session.id,
    hasSeats: session.remainingSeats > 0,
    labels: session.labels ?? undefined,
    eventTitle: session.event.title,
    eventLocation: session.event.location || 'Локация не указана',
    rightTopInner: formatTime(session.startsAt),
    rightBottomInner
  };
};

export function WaitlistPage() {
  const [selectedTab, setSelectedTab] = useState<'hasSeats' | 'noSeats'>('hasSeats');

  const query = useSessionsInfinite({
    onWaitlist: true,
    startsAfter: SESSION_START_DATE,
    sortBy: 'startsAt',
    sortOrder: 'asc',
    minRemainingSeats: selectedTab === 'hasSeats' ? 1 : 0,
  });

  return (
    <PageLayout title="Лист ожиданий">
      <div className={styles.wrapper}>
        <SegmentedControl className={styles.select}>
          <SegmentedControl.Item
            selected={selectedTab === 'hasSeats'}
            onClick={() => setSelectedTab('hasSeats')}
          >
            Есть места
          </SegmentedControl.Item>
          <SegmentedControl.Item
            selected={selectedTab === 'noSeats'}
            onClick={() => setSelectedTab('noSeats')}
          >
            Нет мест
          </SegmentedControl.Item>
        </SegmentedControl>
        <div className={styles.content}>
          <InfiniteScrollList
            key={selectedTab}
            query={query}
            renderItem={(session: Session) => {
              const cardData = transformSessionToCardData(session);
              return <SessionCard key={session.id} data={cardData} />;
            }}
            groupBy={(session: Session) => formatSessionDate(session.startsAt)}
            renderGroupHeader={(day: string) => (
              <div className={styles.day}>{day}</div>
            )}
            emptyMessage="Нет записей"
            errorMessage="Ошибка загрузки тренировок"
            listClassName={styles.dayBlocks}
          />
        </div>
      </div>
    </PageLayout>
  );
}