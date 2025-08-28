import { useState } from 'react';
import styles from './Trainings.module.scss';
import { useEventSessions } from '@/shared/api';
import { getCurrentAndNextMonth, getMonthDateRange } from '@/shared/lib/date-utils';
import { useSessionGroups } from '@/shared/lib/hooks/use-session-groups';
import { HeroSection } from './components/HeroSection';
import { MonthSelector } from './components/MonthSelector';
import { SessionsList } from './components/SessionsList';

export const Trainings = () => {
  const { current, next } = getCurrentAndNextMonth();
  const [selectedMonth, setSelectedMonth] = useState(current);
  const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);

  const { data: eventSessions = [], isLoading, error } = useEventSessions({
    dateFrom,
    dateTo,
    filters: { types: ['surfingTraining'] },
    offset: 0,
    limit: 100
  });

  const sessionGroups = useSessionGroups(eventSessions);

  return (
    <div className={styles.root}>
      <HeroSection />

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
  );
};