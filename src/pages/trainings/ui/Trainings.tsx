import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import styles from './Trainings.module.scss';
import { PageLayout } from '@/widgets/page-layout';
import { useSessionsInfinite, useImages, type EventType, type Session } from '@/shared/api';
import { getCurrentAndNextMonth, getMonthDateRange } from '@/shared/lib/date-utils';
import { formatAvailability, formatPrice, formatDuration, formatTime } from '@/shared/lib';
import { MonthSelector } from './month-selector';
import { InfiniteScrollList } from '@/shared/ui';
import { SessionCard } from './session-card';

const getCategoryInfo = (categoryId: string): { label: EventType | string, title: string } => {
  switch (categoryId) {
    case 'surfing':
      return {
        label: 'training:surfing',
        title: 'Тренировки по серфингу'
      };
    case 'surfskate':
      return {
        label: 'training:surfskate',
        title: 'Тренировки по серфскейту'
      };
    default:
      return {
        label: `training:${categoryId}`,
        title: 'Тренировки'
      };
  }
};

export const Trainings = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { current, next } = getCurrentAndNextMonth();
  const [selectedMonth, setSelectedMonth] = useState(current);

  const { dateFrom, dateTo } = useMemo(() => getMonthDateRange(selectedMonth), [selectedMonth]);
  
  const categoryInfo = getCategoryInfo(categorySlug || '');

  const { data: images } = useImages({"tags.any": [categoryInfo.label]});
  const heroImages = images?.items.map(item => item.url)

  const sessionsQuery = useSessionsInfinite({
    startsAfter: dateFrom,
    endsBefore: dateTo,
    'labels.any': categoryInfo.label ? [categoryInfo.label] : undefined,
    limit: 50
  });

  return (
    <PageLayout
      title={categoryInfo.title}
      heroImages={heroImages}
    >
      <div className={styles.wrapper}>

        <div className={styles.filtersSection}>
          <MonthSelector
            current={current}
            next={next}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />

          <div className={styles.divider}></div>

          <div className={styles.sessions}>
            <InfiniteScrollList
              query={sessionsQuery}
              renderItem={(session: Session) => (
                <SessionCard
                  id={session.id}
                  time={formatTime(session.startsAt)}
                  duration={formatDuration(session.startsAt, session.endsAt)}
                  title={session.event.title}
                  location={session.event.location || 'Не указано'}
                  price={formatPrice(session.event.tickets[0]?.full.price)}
                  availability={formatAvailability(session.remainingSeats)}
                />
              )}
              groupBy={(session: Session) => {
                const sessionDate = new Date(session.startsAt);
                const dayName = sessionDate.toLocaleDateString('ru-RU', { weekday: 'long' });
                const day = sessionDate.getDate();
                const monthName = sessionDate.toLocaleDateString('ru-RU', { month: 'long' });
                return `${dayName} • ${day} ${monthName}`;
              }}
              renderGroupHeader={(dateHeader: string) => (
                <h2 className={styles.dateHeader}>{dateHeader}</h2>
              )}
              groupItemsLayout="horizontal"
              emptyMessage="Тренировки не найдены"
              errorMessage="Ошибка загрузки тренировок"
              listClassName={styles.sessionList}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};