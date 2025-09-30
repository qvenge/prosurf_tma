
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import { BottomBar, Spinner } from '@/shared/ui';
import { useAuth, useTelegramAutoLogin } from '@/shared/api';
import { useTelegramAppInit, telegramUtils } from '@/shared/tma';
import styles from './App.module.scss';

export function App() {
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Get authentication state and methods
  const auth = useAuth();
  const telegramAutoLogin = useTelegramAutoLogin();

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
        if (!auth.isAuthenticated && !auth.isLoading) {
          const initData = telegramUtils.getInitDataRaw();

          if (initData) {
            const result = await telegramAutoLogin.mutateAsync(initData);
            if (result) {
              // Login successful
              setIsInitializing(false);
            } else {
              setAuthError('Authentication failed');
              setIsInitializing(false);
            }
          } else {
            setAuthError('No Telegram data available');
            setIsInitializing(false);
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication failed');
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [telegramApp.isInTelegram, telegramApp.isReady, auth.isAuthenticated, auth.isLoading, telegramApp, telegramAutoLogin]);

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

  const handleNavbarHeightChange = (val: number) => {
    setNavbarHeight(val);
  };

  // Show loading state while initializing or while auth is loading
  if (isInitializing || auth.isLoading || telegramAutoLogin.isPending) {
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
            <p style={{ marginTop: '16px', color: 'var(--tg-theme-text-color, #000)' }}>
              Authenticating...
            </p>
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