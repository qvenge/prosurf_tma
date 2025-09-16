import { useState } from 'react';
import { EmptyListStub, SegmentedControl } from '@/shared/ui'
import { PageLayout } from '@/widgets/page-layout'
import { useBookings, type Booking } from '@/shared/api'
import { formatEventDate, formatTime } from '@/shared/lib/date-utils'
import styles from './MyBookings.module.scss';
import { BookingCard, type BookingCardProps } from './BookingCard';

type BookingsByDay = Array<{ day: string; items: BookingCardProps['data'][]}>;

const transformBookingToCardData = (booking: Booking): BookingCardProps['data'] => {
  // TODO: Need to fetch session data separately to display full information
  // For now, using placeholder data
  return {
    type: 'other',
    eventTitle: `Booking ${booking.id}`,
    eventLocation: 'Location TBD',
    rightTopInner: booking.createdAt ? formatTime(booking.createdAt) : undefined,
    rightBottomInner: undefined
  };
};

const groupBookingsByDate = (bookings: Booking[]): BookingsByDay => {
  const grouped = bookings.reduce((acc, booking) => {
    const dateKey = formatEventDate(booking.createdAt);
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
  
  const { data, isLoading, error } = useBookings();
  const bookings = data?.items || [];
  
  // TODO: Need to fetch session data to properly filter bookings by type
  // For now, showing all bookings in both tabs
  const trainingBookings = bookings.filter((booking: Booking) => 
    booking.status === 'CONFIRMED'
  );
  
  const eventBookings = bookings.filter((booking: Booking) => 
    booking.status === 'CONFIRMED'
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