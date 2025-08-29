
import { useState } from 'react';
import { Outlet } from 'react-router';
import { BottomBar } from '@/shared/ui';
import styles from './App.module.scss';

export function App() {
  const [navbarHeight, setNavbarHeight] = useState(0);

  const handleNavbarHeightChange = (val: number) => {
    setNavbarHeight(val);
  };

  console.log('navbarHeight', navbarHeight);

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