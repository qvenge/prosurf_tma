import styles from './App.module.scss';
import { Navbar } from '@/shared/ui';
import { Outlet } from 'react-router';
import { AppRoot } from '@/shared/app-root';

import '@telegram-apps/telegram-ui/dist/styles.css';

import { HouseBold, BarbellBold, ConfettiBold, UserBold } from '@/shared/ds/icons';

const navItems = [
  {id: 'home', text: 'Главная', icon: HouseBold},
  {id: 'trainings', text: 'Тренировки', icon: BarbellBold},
  {id: 'events', text: 'События', icon: ConfettiBold},
  {id: 'profile', text: 'Профиль', icon: UserBold},
];

export function App() {
  return (
    <AppRoot>
      <div className={styles.root}>
        <div className={styles.content}>
          <Outlet />
        </div>
        <Navbar items={navItems}/>
      </div>
    </AppRoot>
  );
}