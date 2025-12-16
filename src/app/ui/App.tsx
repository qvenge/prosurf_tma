
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { BottomBar, Spinner } from '@/shared/ui';
import { useAuth } from '@/shared/api';
import { useTelegramAppInit } from '@/shared/tma';
import { useAuthInit } from '@/shared/tma/hooks/useAuthInit';
import { logger } from '@/shared/lib/logger';
import styles from './App.module.scss';

export function App() {
  const [navbarHeight, setNavbarHeight] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Get authentication state
  const auth = useAuth();

  // Initialize Telegram Mini App
  const telegramApp = useTelegramAppInit({
    applyTheme: true,
    autoExpand: true,
    enableDebug: process.env.NODE_ENV === 'development',
  });

  // Handle auth initialization
  const { isInitializing, authError } = useAuthInit(telegramApp);

  // Disable vertical swipes to prevent accidental app closure
  useEffect(() => {
    if (telegramApp.isReady && telegramApp.isInTelegram && telegramApp.webApp) {
      const { webApp } = telegramApp;
      // Check if the disableVerticalSwipes method is available (requires v7.7+)
      if (webApp.disableVerticalSwipes && webApp.isVersionAtLeast('7.7')) {
        logger.log('Disabling vertical swipes to prevent accidental app closure');
        webApp.disableVerticalSwipes();
      } else {
        logger.log('disableVerticalSwipes not available - requires Telegram v7.7+');
      }
    }
  }, [telegramApp.isReady, telegramApp.isInTelegram, telegramApp.webApp]);

  useEffect(() => {
    if (telegramApp.isReady && telegramApp.isInTelegram && telegramApp.webApp) {
      const { webApp } = telegramApp;
      webApp.setBackgroundColor('#0F0F0F');
      webApp.setHeaderColor('#0F0F0F');
    }
  }, [telegramApp.isReady, telegramApp.isInTelegram, telegramApp.webApp]);

  // Redirect to profile completion if profile is incomplete
  useEffect(() => {
    if (
      auth.isAuthenticated &&
      !auth.isLoading &&
      auth.user &&
      !(auth.user as any).isProfileComplete &&
      location.pathname !== '/profile/complete'
    ) {
      navigate('/profile/complete', { replace: true });
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user, location.pathname, navigate]);

  const handleNavbarHeightChange = (val: number) => {
    setNavbarHeight(val);
  };

  // Show loading state while initializing or while auth is loading
  if (isInitializing || auth.isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner size="l" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (authError) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.content} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--tg-theme-destructive-text-color, #ff0000)' }}>
              {authError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render main app content only when authenticated
  return (
    <>
      <div className={styles.wrapper} style={{ paddingBottom: `${navbarHeight}px`, ['--navbar-height' as any]: `${navbarHeight}px` }}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
      <BottomBar onHeightChange={handleNavbarHeightChange} />
    </>
  );
}