'use client';

import { useCallback, useContext, useEffect, useState } from 'react';

import { useTelegramTheme } from '@/shared/lib/telegram-sdk';
import { themeParams } from '@telegram-apps/sdk-react';

import { AppRootContext, type AppRootContextInterface } from '../AppRootContext';
import { getBrowserAppearanceSubscriber } from './helpers/getBrowserAppearanceSubscriber';
import { getInitialAppearance } from './helpers/getInitialAppearance';

export const useAppearance = (appearanceProp?: AppRootContextInterface['appearance']): NonNullable<AppRootContextInterface['appearance']> => {
  const { appearance: contextAppearance } = useContext(AppRootContext);
  const [appearance, setAppearance] = useState(appearanceProp || contextAppearance || getInitialAppearance());
  const telegramTheme = useTelegramTheme();

  const handleThemeChange = useCallback(() => {
    const currentTheme = themeParams.state();
    if (currentTheme?.colorScheme) {
      setAppearance(currentTheme.colorScheme);
    }
  }, []);

  useEffect(() => {
    if (appearanceProp !== undefined) {
      setAppearance(appearanceProp);
      return () => {};
    }

    // Use SDK theme if available
    if (telegramTheme?.colorScheme) {
      setAppearance(telegramTheme.colorScheme);

      // Subscribe to theme changes using SDK
      if (themeParams.isSupported()) {
        const unsubscribe = themeParams.on('change', handleThemeChange);
        return () => unsubscribe();
      }
    }

    // Fall back to browser appearance detection
    return getBrowserAppearanceSubscriber(setAppearance);
  }, [appearanceProp, handleThemeChange, telegramTheme]);

  return appearance;
};
