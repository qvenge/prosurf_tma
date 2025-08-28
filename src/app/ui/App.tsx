
import { useState } from 'react';
import { Outlet } from 'react-router';
import { Navbar } from '@/shared/ui';
import { AppRoot } from '@/shared/app-root';
import styles from './App.module.scss';

import '@telegram-apps/telegram-ui/dist/styles.css';


import { HouseBold, BarbellBold, ConfettiBold, UserBold } from '@/shared/ds/icons';

const navItems = [
  {id: 'home', text: 'Главная', path: '/', icon: HouseBold},
  {id: 'trainings', text: 'Тренировки', path: '/trainings', icon: BarbellBold},
  {id: 'events', text: 'События', path: '/events', icon: ConfettiBold},
  {id: 'profile', text: 'Профиль', path: '/profile', icon: UserBold},
];

export function App() {
  const [navbarHeight, setNavbarHeight] = useState(0);

  const handleNavbarHeightChange = (val: number) => {
    setNavbarHeight(val);
  };

  return (
    <AppRoot>
      <div className={styles.root} style={{paddingBottom: `${navbarHeight}px`}}>
        <div className={styles.content}>
          <Outlet />
        </div>
        <Navbar onHeightChange={handleNavbarHeightChange} items={navItems}/>
      </div>
    </AppRoot>
  );
}