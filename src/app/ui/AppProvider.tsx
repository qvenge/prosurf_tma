import { type PropsWithChildren, StrictMode } from 'react';
import { Navbar, BottomBarProvider } from '@/shared/ui';
import { AppRoot } from '@/shared/app-root';
import { ApiProvider } from '@/shared/api';
import { HouseBold, BarbellBold, ConfettiBold, UserBold } from '@/shared/ds/icons';

const navItems = [
  {id: 'home', text: 'Главная', path: '/', icon: HouseBold},
  {id: 'trainings', text: 'Тренировки', path: '/trainings', icon: BarbellBold},
  {id: 'events', text: 'События', path: '/events', icon: ConfettiBold},
  {id: 'profile', text: 'Профиль', path: '/profile', icon: UserBold},
];

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <StrictMode>
      <ApiProvider>
        <AppRoot>
          <BottomBarProvider defaultContent={<Navbar items={navItems} />}>
            {children}
          </BottomBarProvider>
        </AppRoot>
      </ApiProvider>
    </StrictMode>
  );
}
