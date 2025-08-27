import { useState } from 'react';
import styles from './Trainings.module.scss';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { SessionGroup } from '@/shared/ui/session-group';

const imgCover = "http://localhost:3845/assets/9d56337fd9fd9a92228bee24103722e0187c8172.png";
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

  const sessionGroups = [
    {
      dateHeader: 'четверг • 3 июля',
      sessions: [
        {
          time: '21:30',
          duration: '1 ч 30 мин.',
          title: 'Tricks 🔥',
          location: 'Flow Moscow Ставропольская\nул., 43, Москва',
          price: '7 900 ₽',
          availability: { hasSeats: false, text: 'нет мест' }
        },
        {
          time: '22:30',
          title: 'Общая группа',
          location: 'Flow Moscow Ставропольская\nул., 43, Москва',
          price: '7 900 ₽',
          availability: { hasSeats: false, text: 'нет мест' }
        }
      ]
    },
    {
      dateHeader: 'пятница • 4 июля',
      sessions: [
        {
          time: '21:30',
          duration: '1 ч 30 мин.',
          title: 'Tricks 🔥',
          location: 'Flow Moscow Ставропольская\nул., 43, Москва',
          price: '7 900 ₽',
          availability: { hasSeats: true, text: '3 места' }
        },
        {
          time: '22:30',
          title: 'Общая группа',
          location: 'Flow Moscow Ставропольская\nул., 43, Москва',
          price: '7 900 ₽',
          availability: { hasSeats: false, text: 'нет мест' }
        }
      ]
    },
    {
      dateHeader: 'понедельник • 7 июля',
      sessions: [
        {
          time: '21:30',
          duration: '1 ч 30 мин.',
          title: 'Общая группа • Tricks 🔥',
          location: 'Flow Moscow Ставропольская\nул., 43, Москва',
          price: '7 900 ₽',
          availability: { hasSeats: true, text: '3 места' }
        },
        {
          time: '22:30',
          title: 'Общая группа',
          location: 'Flow Moscow Ставропольская\nул., 43, Москва',
          price: '7 900 ₽',
          availability: { hasSeats: false, text: 'нет мест' }
        }
      ]
    }
  ];

  return (
    <div className={styles.root}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div 
          className={styles.cover}
          style={{ backgroundImage: `url('${imgCover}')` }}
        >
          <div className={styles.pagination}>
            <div className={styles.activeDot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </div>
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