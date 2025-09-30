import { useState } from 'react';
import { useParams } from 'react-router';
import styles from './Trainings.module.scss';
import { PageLayout } from '@/widgets/page-layout';
import { useSessions, type EventType } from '@/shared/api';
import { getCurrentAndNextMonth, getMonthDateRange } from '@/shared/lib/date-utils';
import { useSessionGroups } from '@/shared/lib/hooks/use-session-groups';
import { MonthSelector } from './components/MonthSelector';
import { SessionsList } from './components/SessionsList';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];

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
  const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);
  
  const categoryInfo = getCategoryInfo(categorySlug || '');

  const { data, isLoading, error } = useSessions({
    startsAfter: dateFrom,
    endsBefore: dateTo,
    'labels.any': categoryInfo.label ? [categoryInfo.label] : undefined,
    limit: 100
  });
  const eventSessions = data?.items || [];

  const sessionGroups = useSessionGroups(eventSessions);

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
            <SessionsList
              sessionGroups={sessionGroups}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};