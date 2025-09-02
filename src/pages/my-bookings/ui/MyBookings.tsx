import { useState, useMemo } from 'react';
import { EmptyListStub, SegmentedControl } from '@/shared/ui'
import { PageLayout } from '@/widgets/page-layout'
import { useUserBookings, type BookingWithSessionResponse } from '@/shared/api'
import { formatTourDates, formatEventDate, formatTime } from '@/shared/lib/date-utils'
import { formatDuration } from '@/shared/lib/format-utils'
import styles from './MyBookings.module.scss';
import { BookingCard, type BookingCardProps } from './BookingCard';

type BookingsByDay = Array<{ day: string; items: BookingCardProps['data'][]}>;

const transformBookingToCardData = (booking: BookingWithSessionResponse): BookingCardProps['data'] => {
  const { session } = booking;
  
  let rightTopInner: string | undefined;
  let rightBottomInner: string | undefined;
  
  if (session.type === 'tour') {
    const tourDates = formatTourDates(session.start, session.end);
    rightTopInner = tourDates.dates;
    rightBottomInner = tourDates.year;
  } else {
    rightTopInner = formatTime(session.start);
    rightBottomInner = session.end ? formatDuration(session.start, session.end) : undefined;
  }
  
  return {
    type: session.type,
    eventTitle: session.title,
    eventLocation: session.location,
    rightTopInner,
    rightBottomInner
  };
};

const groupBookingsByDate = (bookings: BookingWithSessionResponse[]): BookingsByDay => {
  const grouped = bookings.reduce((acc, booking) => {
    const dateKey = formatEventDate(booking.session.start);
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
  
  const sessionStartFrom = useMemo(() => new Date().toISOString(), []);
  
  const { data: bookings = [], isLoading, error } = useUserBookings(undefined, {
    status: ['CONFIRMED'],
    sessionStartFrom,
    sortBy: 'sessionStart',
    sortOrder: 'asc'
  });
  
  const trainingBookings = bookings.filter(booking => 
    booking.session.type === 'surfingTraining' || booking.session.type === 'surfskateTraining'
  );
  
  const eventBookings = bookings.filter(booking => 
    booking.session.type === 'tour' || booking.session.type === 'other'
  );
  
  const trainings = groupBookingsByDate(trainingBookings);
  const events = groupBookingsByDate(eventBookings);
  
  const items = selectedTab === 'trainings' ? trainings : events;
  
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
    <PageLayout title="Мои записи">
      <div className={styles.wrapper  }>
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
        {items.length > 0 ? (
          <div className={styles.content}>
            <BookingList key={selectedTab} blocks={items} />
          </div>
        ) : (
          <div className={styles.emptyStub}>
            <EmptyListStub message="У вас пока нет записей" />
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function BookingList({blocks}: {blocks: BookingsByDay}) {
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