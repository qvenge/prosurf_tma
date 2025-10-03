import { useState } from 'react';
import { EmptyListStub, SegmentedControl } from '@/shared/ui'
import { PageLayout } from '@/widgets/page-layout'
import { useSessions, type Session } from '@/shared/api'
import { formatSessionDate, formatTime } from '@/shared/lib/date-utils'
import styles from './WaitlistPage.module.scss';
import { SessionCard, type SessionCardProps } from './SessionCard';

type SessionsByDay = Array<{ day: string; items: SessionCardProps['data'][]}>;

const labels = {
  trainings: ['training:surfing', 'training:wakeboarding', 'training:surfskate'],
  events: ['tour', 'activity']
};

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

const groupSessionsByDate = (sessions: Session[]): [SessionsByDay, SessionsByDay] => {
  const hasSeats = sessions.filter(s => (s.remainingSeats ?? 0) > 0);
  const noSeats = sessions.filter(s => (s.remainingSeats ?? 0) === 0);

  const groupByDate = (sessionsList: Session[]): SessionsByDay => {
    const grouped = sessionsList.reduce((acc, session) => {
      const dateKey = formatSessionDate(session!.startsAt);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(transformSessionToCardData(session));
      return acc;
    }, {} as Record<string, SessionCardProps['data'][]>);

    return Object.entries(grouped).map(([day, items]) => ({ day, items }));
  };

  return [groupByDate(hasSeats), groupByDate(noSeats)];
};

export function WaitlistPage() {
  const [selectedTab, setSelectedTab] = useState<'hasSeats' | 'noSeats'>('hasSeats');
  
  // const sessionStartFrom = useMemo(() => new Date().toISOString(), []); // TODO: Use when needed
  
  const { data, isLoading, error } = useSessions({ onWaitlist: true });
  
  const [hasSeatsItems, noSeatsItems] = groupSessionsByDate(data?.items.sort((a: Session, b: Session) => {
    const aDate = new Date(a.startsAt).getTime();
    const bDate = new Date(b.startsAt).getTime();
    return aDate - bDate;
  }) || []);

  if (isLoading) {
    return (
      <PageLayout title="Мои записи">
        <div className={styles.wrapper}>
          <div className={styles.loading}>Загрузка...</div>
        </div>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout title="Мои записи">
        <div className={styles.wrapper}>
          <div className={styles.error}>Ошибка загрузки записей. Попробуйте позже.</div>
        </div>
      </PageLayout>
    );
  }

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
        {(selectedTab === 'hasSeats' ? hasSeatsItems : noSeatsItems).length > 0 ? (
          <div className={styles.content}>
            <Waitlist key={selectedTab} blocks={selectedTab === 'hasSeats' ? hasSeatsItems : noSeatsItems} />
          </div>
        ) : (
          <div className={styles.emptyStub}>
            <EmptyListStub message="Нет записей" />
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function Waitlist({blocks}: {blocks: SessionsByDay}) {
  return (
    <div className={styles.dayBlocks}>
      {blocks.map((block) => (
        <div key={block.day} className={styles.dayBlock}>
          <div className={styles.day}>{block.day}</div>
          {block.items.map((event) => (
            <SessionCard key={event.eventTitle} data={event} />
          ))}
        </div>
      ))}
    </div>
  );
}