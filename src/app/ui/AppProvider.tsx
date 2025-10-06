import { type PropsWithChildren, StrictMode, useMemo } from 'react';
import { Outlet } from 'react-router';
import { Navbar, BottomBarProvider } from '@/shared/ui';
import { AppRoot } from '@/shared/app-root';
import { ApiProvider } from '@/shared/api';
import { NavigatorProvider } from '@/shared/navigation';
import { HouseBold, BarbellBold, ConfettiBold, UserBold } from '@/shared/ds/icons';

const navItems = [
  {id: 'home', text: 'Главная', path: '/', icon: HouseBold},
  {id: 'trainings', text: 'Тренировки', path: '/trainings', icon: BarbellBold},
  {id: 'events', text: 'События', path: '/events', icon: ConfettiBold},
  {id: 'profile', text: 'Профиль', path: '/profile', icon: UserBold},
];

export function AppProvider({}: PropsWithChildren) {
  const defaultBar = useMemo(() => <Navbar items={navItems} />, []);

  return (
    <StrictMode>
      <ApiProvider>
        <AppRoot>
          <NavigatorProvider>
            <BottomBarProvider defaultContent={defaultBar}>
              <Outlet />
            </BottomBarProvider>
          </NavigatorProvider>
        </AppRoot>
      </ApiProvider>
    </StrictMode>
  );
}
