
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { BottomBar, Spinner } from '@/shared/ui';
import { useAuth } from '@/shared/api';
import { useTelegramAppInit, telegramUtils } from '@/shared/tma';
import styles from './App.module.scss';

export function App() {
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Get authentication state and methods
  const auth = useAuth();

  // Initialize Telegram Mini App
  const telegramApp = useTelegramAppInit({
    applyTheme: true,
    autoExpand: true,
    enableDebug: process.env.NODE_ENV === 'development',
  });


  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Wait for Telegram app to be ready
        if (!telegramApp.isReady) {
          return; // Keep waiting
        }

        // Check if we're running in Telegram environment
        if (!telegramApp.isInTelegram) {
          setAuthError('This app works only in Telegram');
          setIsInitializing(false);
          return;
        }

        // If already authenticated, we're done
        if (auth.isAuthenticated && !auth.isLoading) {
          setIsInitializing(false);
          return;
        }

        // If not authenticated and auth is not loading, try Telegram auto-login
        // Only attempt once to prevent infinite loop
        if (!auth.isAuthenticated && !auth.isLoading && !autoLoginAttempted) {
          setAutoLoginAttempted(true); // Set flag immediately to prevent duplicate calls

          const initData = telegramUtils.getInitDataRaw();

          if (initData) {
            try {
              // Use auth context method which properly updates auth state
              await auth.loginWithTelegram({ initData });
              // Login successful - auth state is now updated automatically
              setIsInitializing(false);
            } catch (error) {
              console.error('Telegram login error:', error);
              setAuthError(error instanceof Error ? error.message : 'Ошибка авторизации');
              setIsInitializing(false);
            }
          } else {
            setAuthError('No Telegram data available');
            setIsInitializing(false);
          }
        } else if (autoLoginAttempted && !auth.isAuthenticated) {
          // Auto-login was attempted but still not authenticated
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        setAuthError(error instanceof Error ? error.message : 'Ошибка инициализации аутентификации');
        setIsInitializing(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramApp.isInTelegram, telegramApp.isReady, auth.isAuthenticated, auth.isLoading, autoLoginAttempted]);

  // Disable vertical swipes to prevent accidental app closure
  useEffect(() => {
    if (telegramApp.isReady && telegramApp.isInTelegram && telegramApp.webApp) {
      const { webApp } = telegramApp;
      // Check if the disableVerticalSwipes method is available (requires v7.7+)
      if (webApp.disableVerticalSwipes && webApp.isVersionAtLeast('7.7')) {
        console.log('Disabling vertical swipes to prevent accidental app closure');
        webApp.disableVerticalSwipes();
      } else {
        console.log('disableVerticalSwipes not available - requires Telegram v7.7+');
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
      <div className={styles.wrapper} style={{paddingBottom: `${navbarHeight}px`}}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
      <BottomBar onHeightChange={handleNavbarHeightChange} />
    </>
  );
}