import { useState } from 'react';
import { EmptyListStub, SegmentedControl, Spinner } from '@/shared/ui'
import { PageLayout } from '@/widgets/page-layout'
import { useSessions, type Session } from '@/shared/api'
import { formatSessionDate, formatTime } from '@/shared/lib/date-utils'
import styles from './WaitlistPage.module.scss';
import { SessionCard, type SessionCardProps } from './SessionCard';
import clsx from 'clsx';

type SessionsByDay = Array<{ day: string; items: SessionCardProps['data'][]}>;

interface WaitlistProps {
  blocks: SessionsByDay;
  isLoading: boolean;
  error: any;
}

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
          <Waitlist
            key={selectedTab}
            isLoading={isLoading}
            error={error}
            blocks={selectedTab === 'hasSeats' ? hasSeatsItems : noSeatsItems} />
        </div>
      </div>
    </PageLayout>
  );
}

function Waitlist({blocks, isLoading, error}: WaitlistProps) {
  if (isLoading) {
    return (
      <div className={styles.stub}>
        <Spinner size="l" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(styles.stub, styles.error)}>
        <div>Ошибка загрузки тренировок</div>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className={styles.stub}>
        <EmptyListStub message="Нет записей" />
      </div>
    );
  }

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