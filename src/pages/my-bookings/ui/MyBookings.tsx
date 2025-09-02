import { useState } from 'react';
import { EmptyListStub, SegmentedControl } from '@/shared/ui'
import { PageLayout } from '@/widgets/page-layout'
import styles from './MyBookings.module.scss';
import { BookingCard, type BookingCardProps } from './BookingCard';

type BookingsByDay = Array<{ day: string; items: BookingCardProps['data'][]}>;

const trainings: BookingsByDay = [
  {
    day: '3 июля • четверг',
    items: [
      {
        type: 'surfingTraining',
        eventTitle: 'Общая группаа',
        eventLocation: 'Flow Moscow Ставропольская, ул. 43, Москва',
        rightTopInner: '21:30',
        rightBottomInner: '1 ч 30 мин'
      },
      {
        type: 'surfingTraining',
        eventTitle: 'Общая группаа',
        eventLocation: 'Flow Moscow Ставропольская, ул. 43, Москва',
        rightTopInner: '21:30',
        rightBottomInner: '1 ч 30 мин'
      }
    ]
  },
      {
    day: '4 июля • пятница',
    items: [
      {
        type: 'surfskateTraining',
        eventTitle: 'Общая группаа',
        eventLocation: 'Flow Moscow Ставропольская, ул. 43, Москва',
        rightTopInner: '21:30',
        rightBottomInner: '1 ч 30 мин'
      },
      {
        type: 'surfskateTraining',
        eventTitle: 'Общая группаа',
        eventLocation: 'Flow Moscow Ставропольская, ул. 43, Москва',
        rightTopInner: '21:30',
        rightBottomInner: '1 ч 30 мин'
      }
    ]
  }
];

const events: BookingsByDay = [
  {
    day: '3 июля • четверг',
    items: [
      {
        type: 'other',
        eventTitle: 'SurfSkate Встреча',
        eventLocation: 'Flow Moscow Ставропольская, ул. 43, Москва',
        rightTopInner: '21:30'
      }
    ]
  },
      {
    day: '4 июля • пятница',
    items: [
      {
        type: 'tour',
        eventTitle: 'ProSurf Camp / Bali',
        eventLocation: 'Бали, Индонезия',
        rightTopInner: '1 мая – 6 июня',
        rightBottomInner: '2025 г'
      },
      {
        type: 'other',
        eventTitle: 'SurfSkate Встреча',
        eventLocation: 'Flow Moscow Ставропольская, ул. 43, Москва',
        rightTopInner: '21:30'
      }
    ]
  }
];

export function MyBookings() {
  const [selectedTab, setSelectedTab] = useState<'trainings' | 'events'>('trainings');
  const items = selectedTab === 'trainings' ? trainings : events;

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