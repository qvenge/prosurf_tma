import { TourList } from './TourList';
import { OtherEventList } from './OtherEventList';
import { SegmentedControl } from '@/shared/ui';
import styles from './EventsPage.module.scss';
import { useState } from 'react';

export const EventsPage = () => {
  const [selectedTab, setSelectedTab]= useState('tours');

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>События</h1>
      <SegmentedControl className={styles.select}>
        <SegmentedControl.Item
          selected={selectedTab === 'tours'}
          onClick={() => setSelectedTab('tours')}
        >
          Туры
        </SegmentedControl.Item>
        <SegmentedControl.Item
          selected={selectedTab === 'otherEvents'}
          onClick={() => setSelectedTab('otherEvents')}
        >
          Ивенты
        </SegmentedControl.Item>
      </SegmentedControl>
      <div className={styles.content}>
        {selectedTab === 'tours' ? <TourList /> : <OtherEventList />}
      </div>
    </div>
  );
};