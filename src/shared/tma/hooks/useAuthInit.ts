import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/api';
import { telegramUtils } from '../telegram-sdk';
import type { initializeTelegramApp } from '../index';

interface UseAuthInitResult {
  isInitializing: boolean;
  authError: string | null;
}

/**
 * Custom hook to handle Telegram auto-login initialization
 * Separated from App.tsx for better testability and reusability
 */
export function useAuthInit(telegramApp: Awaited<ReturnType<typeof initializeTelegramApp>>): UseAuthInitResult {
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Wait for Telegram app to be ready
        if (!telegramApp.isReady) {
          return;
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

        // Attempt Telegram auto-login once
        if (!auth.isAuthenticated && !auth.isLoading && !autoLoginAttempted) {
          setAutoLoginAttempted(true);

          const initData = telegramUtils.getInitDataRaw();

          if (initData) {
            try {
              await auth.loginWithTelegram({ initData });
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
          setIsInitializing(false);
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        setAuthError(error instanceof Error ? error.message : 'Ошибка инициализации аутентификации');
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [telegramApp.isReady, telegramApp.isInTelegram, auth.isAuthenticated, auth.isLoading, auth, autoLoginAttempted]);

  return {
    isInitializing,
    authError,
  };
}
