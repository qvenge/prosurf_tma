import { useState, useMemo } from 'react';
import styles from './Trainings.module.scss';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { SessionGroup } from '@/shared/ui/session-group';
import { ImageSlider } from '@/shared/ui/image-slider';
import { useEventSessions } from '@/shared/api';

const heroImages = [
  '/images/surfing1.jpg',
  '/images/surfing2.png',
];
const imgMultiselectChecked = "http://localhost:3845/assets/aafa7c11b116dc581d1d62c95e5485577066b924.svg";
const imgMultiselectUnchecked = "http://localhost:3845/assets/20db19bc67f555197498ea8643efdf8c29fca4a2.svg";

export const Trainings = () => {
  const getCurrentAndNextMonth = () => {
    const now = new Date();
    const currentMonth = now.toLocaleDateString('ru-RU', { month: 'long' });
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1).toLocaleDateString('ru-RU', { month: 'long' });
    return {
      current: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
      next: nextMonth.charAt(0).toUpperCase() + nextMonth.slice(1)
    };
  };

  const { current, next } = getCurrentAndNextMonth();
  const [selectedMonth, setSelectedMonth] = useState(current);

  const getMonthDateRange = (monthName: string) => {
    const now = new Date();
    const currentMonthName = now.toLocaleDateString('ru-RU', { month: 'long' });
    const isCurrentMonth = monthName.toLowerCase() === currentMonthName;
    
    const targetDate = isCurrentMonth ? now : new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const dateFrom = new Date(year, month, 1).toISOString();
    const dateTo = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    
    return { dateFrom, dateTo };
  };

  const { dateFrom, dateTo } = getMonthDateRange(selectedMonth);

  const { data: eventSessions = [], isLoading, error } = useEventSessions({
    dateFrom,
    dateTo,
    filters: { types: ['surfingTraining'] },
    offset: 0,
    limit: 100
  });

  const sessionGroups = useMemo(() => {
    if (!eventSessions.length) return [];

    const groupedSessions = eventSessions.reduce((groups, session) => {
      const sessionDate = new Date(session.start);
      const dayName = sessionDate.toLocaleDateString('ru-RU', { weekday: 'long' });
      const day = sessionDate.getDate();
      const monthName = sessionDate.toLocaleDateString('ru-RU', { month: 'long' });
      const dateKey = `${dayName} • ${day} ${monthName}`;

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      const formatDuration = (start: string, end: string | null) => {
        if (!end) return undefined;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours === 0) return `${minutes} мин.`;
        if (minutes === 0) return `${hours} ч`;
        return `${hours} ч ${minutes} мин.`;
      };

      const formatAvailability = (remainingSeats: number) => {
        if (remainingSeats === 0) {
          return { hasSeats: false, text: 'нет мест' };
        } else if (remainingSeats === 1) {
          return { hasSeats: true, text: '1 место' };
        } else if (remainingSeats < 5) {
          return { hasSeats: true, text: `${remainingSeats} места` };
        } else {
          return { hasSeats: true, text: `${remainingSeats} мест` };
        }
      };

      const formatPrice = (price: { amount: string; currency: string }) => {
        const amount = parseFloat(price.amount).toLocaleString('ru-RU');
        return price.currency === 'RUB' ? `${amount} ₽` : `${amount} ${price.currency}`;
      };

      groups[dateKey].push({
        time: new Date(session.start).toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: formatDuration(session.start, session.end),
        title: session.title,
        location: session.location,
        price: formatPrice(session.price),
        availability: formatAvailability(session.remainingSeats)
      });

      return groups;
    }, {} as Record<string, Array<{
      time: string;
      duration?: string;
      title: string;
      location: string;
      price: string;
      availability: { hasSeats: boolean; text: string };
    }>>);

    return Object.entries(groupedSessions).map(([dateHeader, sessions]) => ({
      dateHeader,
      sessions
    }));
  }, [eventSessions]);

  return (
    <div className={styles.root}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <ImageSlider 
          images={heroImages}
          className={styles.imageSlider}
        />
        <h1 className={styles.title}>Тренировки по серфингу</h1>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        {/* Month Selector */}
        <div className={styles.monthSelector}>
          <SegmentedControl>
            <SegmentedControl.Item
              selected={selectedMonth === current}
              onClick={() => setSelectedMonth(current)}
            >
              {current}
            </SegmentedControl.Item>
            <SegmentedControl.Item
              selected={selectedMonth === next}
              onClick={() => setSelectedMonth(next)}
            >
              {next}
            </SegmentedControl.Item>
          </SegmentedControl>
        </div>

        <div className={styles.divider}></div>

        {/* Filter Chips */}
        <div className={styles.filterChips}>
          <div className={`${styles.chip} ${styles.active}`}>
            <img src={imgMultiselectChecked} alt="" className={styles.chipIcon} />
            <span>Общая группа</span>
          </div>
          <div className={styles.chip}>
            <img src={imgMultiselectUnchecked} alt="" className={styles.chipIcon} />
            <span>Tricks</span>
          </div>
          <div className={styles.chip}>
            <img src={imgMultiselectUnchecked} alt="" className={styles.chipIcon} />
            <span>Есть места</span>
          </div>
        </div>

        {/* Training Sessions */}
        <div className={styles.sessions}>
          {isLoading && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Загрузка тренировок...
            </div>
          )}
          {error && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#ff4444' }}>
              Ошибка загрузки тренировок
            </div>
          )}
          {!isLoading && !error && sessionGroups.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              Тренировки не найдены
            </div>
          )}
          {sessionGroups.map((group, index) => (
            <SessionGroup
              key={index}
              dateHeader={group.dateHeader}
              sessions={group.sessions}
            />
          ))}
        </div>
      </div>
    </div>
  );
};