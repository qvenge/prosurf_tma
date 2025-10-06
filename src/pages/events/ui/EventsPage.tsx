import { TourList } from './TourList';
import { ActivityList } from './ActivityList';
import { SegmentedControl } from '@/shared/ui';
import styles from './EventsPage.module.scss';
import { useState } from 'react';
import { PageLayout } from '@/widgets/page-layout';

export const EventsPage = () => {
  const [selectedTab, setSelectedTab]= useState('tours');

  return (
    <PageLayout title="События">
      <div className={styles.wrapper}>
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
          {selectedTab === 'tours' ? <TourList /> : <ActivityList />}
        </div>
      </div>
    </PageLayout>
  );
};