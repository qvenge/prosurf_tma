import { useState } from 'react';
import { EmptyListStub, SegmentedControl, Spinner } from '@/shared/ui'
import { PageLayout } from '@/widgets/page-layout'
import { useBookings, type BookingExtended } from '@/shared/api'
import { formatSessionDate, formatTime } from '@/shared/lib/date-utils'
import styles from './MyBookings.module.scss';
import { BookingCard, type BookingCardProps } from './BookingCard';
import clsx from 'clsx';

type BookingsByDay = Array<{ day: string; items: BookingCardProps['data'][]}>;

interface BookingListProps {
  blocks: BookingsByDay;
  isLoading: boolean;
  error: any;
}

const labels = {
  trainings: ['training:surfing', 'training:wakeboarding', 'training:surfskate'],
  events: ['tour', 'activity']
};

const transformBookingToCardData = (booking: BookingExtended): BookingCardProps['data'] => {
  if ('session' in booking && booking.session) {
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

    const rightBottomInner = formatSessionDurationOrYear(booking.session.startsAt, booking.session.endsAt);

    return {
      labels: booking.session.labels ?? undefined,
      eventTitle: booking.session.event.title,
      eventLocation: booking.session.event.location || 'Локация не указана',
      rightTopInner: formatTime(booking.session.startsAt),
      rightBottomInner
    };
  }
  
  // Fallback for bookings without session data
  return {
    labels: ['other'],
    eventTitle: `Booking ${booking.id}`,
    eventLocation: 'Location TBD',
    rightTopInner: booking.createdAt ? formatTime(booking.createdAt) : undefined,
    rightBottomInner: undefined
  };
};

const groupBookingsByDate = (bookings: BookingExtended[]): BookingsByDay => {
  const grouped = bookings.reduce((acc, booking) => {
    const dateKey = formatSessionDate(booking.session!.startsAt);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transformBookingToCardData(booking));
    return acc;
  }, {} as Record<string, BookingCardProps['data'][]>);

  return Object.entries(grouped).map(([day, items]) => ({ day, items }));
};

export function MyBookings() {
  const [selectedTab, setSelectedTab] = useState<'trainings' | 'events'>('trainings');
  
  // const sessionStartFrom = useMemo(() => new Date().toISOString(), []); // TODO: Use when needed
  
  const { data, isLoading, error } = useBookings({
    includeSession: true,
    status: ['CONFIRMED'],
    'labels.any': labels[selectedTab]
  });
  
  const items = groupBookingsByDate(data?.items.sort((a: BookingExtended, b: BookingExtended) => {
    const aDate = new Date(a.session!.startsAt).getTime();
    const bDate = new Date(b.session!.startsAt).getTime();
    return aDate - bDate;
  }) || []);

  return (
    <PageLayout title="Мои записи">
      <div className={styles.wrapper}>
        <SegmentedControl className={styles.select}>
          <SegmentedControl.Item
            selected={selectedTab === 'trainings'}
            onClick={() => setSelectedTab('trainings')}
          >
            Тренировки
          </SegmentedControl.Item>
          <SegmentedControl.Item
            selected={selectedTab === 'events'}
            onClick={() => setSelectedTab('events')}
          >
            События
          </SegmentedControl.Item>
        </SegmentedControl>
        <div className={styles.content}>
          <BookingList
            key={selectedTab}
            isLoading={isLoading}
            error={error}
            blocks={items}
          />
        </div>
      </div>
    </PageLayout>
  );
}

function BookingList({blocks, isLoading, error}: BookingListProps) {
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
        <EmptyListStub message="У вас пока нет записей" />
      </div>
    );
  }

  return (
    <div className={styles.dayBlocks}>
      {blocks.map((block) => (
        <div key={block.day} className={styles.dayBlock}>
          <div className={styles.day}>{block.day}</div>
          {block.items.map((event) => (
            <BookingCard key={event.eventTitle} data={event} />
          ))}
        </div>
      ))}
    </div>
  );
}