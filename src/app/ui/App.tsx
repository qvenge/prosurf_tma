
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { BottomBar } from '@/shared/ui';
import { useTelegramAuth } from '@/shared/api';
import styles from './App.module.scss';

import { useRawInitData, swipeBehavior } from '@telegram-apps/sdk-react';

export function App() {
  const [navbarHeight, setNavbarHeight] = useState(0);
  const rawInitData = useRawInitData();
  const { mutate: authenticate, status } = useTelegramAuth();

  const handleNavbarHeightChange = (val: number) => {
    setNavbarHeight(val);
  };

  useEffect(() => {
    (async () => {
      swipeBehavior.mount();
      swipeBehavior.disableVertical();
    })();
  }, []);


  useEffect(() => {
    if (rawInitData == null || status !== 'idle') return;
    authenticate({ initData: rawInitData });
  }, [rawInitData, authenticate, status])

  return (
    <>
      <div className={styles.wrapper} style={{paddingBottom: `${navbarHeight}px`}}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
      <BottomBar onHeightChange={handleNavbarHeightChange} />
    </>
  );
}