import { useState, useMemo } from 'react';
import { SegmentedControl } from '@/shared/ui'
import { PageLayout } from '@/widgets/page-layout'
import { useSessionsInfinite, type Session } from '@/shared/api'
import { formatSessionDate, formatTime } from '@/shared/lib/date-utils'
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

  const query = useSessionsInfinite({ onWaitlist: true });

  // Filter sessions based on selected tab
  const filteredSessions = useMemo(() => {
    const allSessions = query.data?.pages.flatMap((page) => page.items) ?? [];
    return selectedTab === 'hasSeats'
      ? allSessions.filter(s => (s.remainingSeats ?? 0) > 0)
      : allSessions.filter(s => (s.remainingSeats ?? 0) === 0);
  }, [query.data, selectedTab]);

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
          <WaitlistContent
            key={selectedTab}
            query={query}
            sessions={filteredSessions}
          />
        </div>
      </div>
    </PageLayout>
  );
}

function WaitlistContent({
  query,
  sessions,
}: {
  query: ReturnType<typeof useSessionsInfinite>;
  sessions: Session[];
}) {
  if (query.isLoading) {
    return (
      <div className={styles.stub}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className={styles.stub}>
        <div>Ошибка загрузки тренировок</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={styles.stub}>
        <div>Нет записей</div>
      </div>
    );
  }

  return (
    <div className={styles.dayBlocks}>
      {sessions.reduce((groups: Array<{ day: string; sessions: Session[] }>, session) => {
        const day = formatSessionDate(session.startsAt);
        const existingGroup = groups.find(g => g.day === day);

        if (existingGroup) {
          existingGroup.sessions.push(session);
        } else {
          groups.push({ day, sessions: [session] });
        }

        return groups;
      }, []).map((group) => (
        <div key={group.day} className={styles.dayBlock}>
          <div className={styles.day}>{group.day}</div>
          {group.sessions.map((session) => {
            const cardData = transformSessionToCardData(session);
            return <SessionCard key={session.id} data={cardData} />;
          })}
        </div>
      ))}

      {query.isFetchingNextPage && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          Loading more...
        </div>
      )}

      {query.hasNextPage && (
        <div
          ref={(el) => {
            if (!el || query.isFetchingNextPage) return;
            const observer = new IntersectionObserver((entries) => {
              if (entries[0].isIntersecting) {
                query.fetchNextPage();
              }
            });
            observer.observe(el);
            return () => observer.disconnect();
          }}
          style={{ height: '1px' }}
        />
      )}
    </div>
  );
}