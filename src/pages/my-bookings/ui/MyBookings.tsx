import { useState, useMemo } from 'react';
import { InfiniteScrollList, SegmentedControl } from '@/shared/ui'
import { PageLayout } from '@/widgets/page-layout'
import { useBookingsInfinite, type BookingExtended, type BookingFilters } from '@/shared/api'
import { formatSessionDate, formatTime, SESSION_START_DATE } from '@/shared/lib/date-utils'
import styles from './MyBookings.module.scss';
import { BookingCard, type BookingCardProps } from './BookingCard';

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

export function MyBookings() {
  const [selectedTab, setSelectedTab] = useState<'trainings' | 'events'>('trainings');

  const filters: BookingFilters = useMemo(() => ({
    status: ['CONFIRMED'],
    includeSession: true,
    limit: 50,
    startsAfter: SESSION_START_DATE,
    sortBy: 'startsAt',
    sortOrder: 'asc',
    'labels.any': labels[selectedTab]
  }), [selectedTab]);

  const query = useBookingsInfinite(filters);

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
          <InfiniteScrollList
            key={selectedTab}
            query={query}
            renderItem={(booking: BookingExtended) => {
              const cardData = transformBookingToCardData(booking);
              return <BookingCard key={booking.id} data={cardData} />;
            }}
            groupBy={(booking: BookingExtended) => formatSessionDate(booking.session!.startsAt)}
            renderGroupHeader={(day: string) => (
              <div className={styles.day}>{day}</div>
            )}
            emptyMessage="У вас пока нет записей"
            errorMessage="Ошибка загрузки тренировок"
            listClassName={styles.dayBlocks}
          />
        </div>
      </div>
    </PageLayout>
  );
}