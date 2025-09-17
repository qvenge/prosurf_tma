import {
  useLaunchParams,
  useSignal,
  openInvoice,
  isTMA,
  miniApp,
  themeParams,
  initData,
  viewport,
  backButton,
  mainButton,
  hapticFeedback,
  type InitData,
  type ThemeParams,
  type User as TelegramUser,
  type LaunchParams,
} from '@telegram-apps/sdk-react';

/**
 * Centralized Telegram SDK utilities and hooks
 * Provides type-safe access to Telegram Mini App APIs
 */

// Re-export commonly used types
export type { InitData, ThemeParams, TelegramUser, LaunchParams };

/**
 * Hook to get Telegram user data
 * Returns null if not in Telegram environment or user not available
 */
export const useTelegramUser = (): TelegramUser | null => {
  try {
    const data = useSignal(initData);
    return data?.user || null;
  } catch {
    return null;
  }
};

/**
 * Hook to get all Telegram init data
 * Returns null if not in Telegram environment
 */
export const useTelegramInitData = (): InitData | null => {
  try {
    return useSignal(initData) || null;
  } catch {
    return null;
  }
};

/**
 * Hook to get raw init data string for authentication
 */
export const useTelegramInitDataRaw = (): string | null => {
  try {
    const params = useLaunchParams();
    return params?.tgWebAppData || null;
  } catch {
    return null;
  }
};

/**
 * Hook to get theme parameters
 */
export const useTelegramTheme = (): ThemeParams | null => {
  try {
    return useSignal(themeParams) || null;
  } catch {
    return null;
  }
};

/**
 * Hook to get platform information
 */
export const useTelegramPlatform = (): string | null => {
  try {
    const params = useLaunchParams();
    return params?.tgWebAppPlatform || null;
  } catch {
    return null;
  }
};

/**
 * Hook to get viewport information
 */
export const useTelegramViewport = () => {
  try {
    return useSignal(viewport);
  } catch {
    return null;
  }
};

/**
 * Hook to access mini app methods
 */
export const useTelegramMiniApp = () => {
  try {
    return miniApp;
  } catch {
    return null;
  }
};

/**
 * Hook to access back button
 */
export const useTelegramBackButton = () => {
  try {
    return backButton;
  } catch {
    return null;
  }
};

/**
 * Hook to access main button
 */
export const useTelegramMainButton = () => {
  try {
    return mainButton;
  } catch {
    return null;
  }
};

/**
 * Hook to access haptic feedback
 */
export const useTelegramHapticFeedback = () => {
  try {
    return hapticFeedback;
  } catch {
    return null;
  }
};

/**
 * Utility functions for non-hook usage
 */
export const telegramUtils = {
  /**
   * Check if running in Telegram environment
   */
  isTelegramEnv: async (): Promise<boolean> => {
    try {
      return await isTMA();
    } catch {
      return false;
    }
  },

  /**
   * Get init data for authentication (non-hook version)
   */
  getInitDataRaw: (): string | null => {
    try {
      const state = initData.state();
      if (!state?.raw) return null;
      return state.raw;
    } catch {
      return null;
    }
  },

  /**
   * Get current theme parameters (non-hook version)
   */
  getThemeParams: (): ThemeParams | null => {
    try {
      return themeParams.state() || null;
    } catch {
      return null;
    }
  },

  /**
   * Get current user (non-hook version)
   */
  getUser: (): TelegramUser | null => {
    try {
      const state = initData.state();
      return state?.user || null;
    } catch {
      return null;
    }
  },

  /**
   * Open payment invoice
   */
  openInvoice: async (slug: string): Promise<'paid' | 'cancelled' | 'pending' | 'failed' | string> => {
    try {
      const result = await openInvoice(slug);
      return result;
    } catch (error) {
      console.error('Failed to open invoice:', error);
      throw error;
    }
  },

  /**
   * Expand mini app to full height
   */
  expand: (): void => {
    try {
      if (miniApp.isMounted()) {
        miniApp.expand();
      }
    } catch (error) {
      console.error('Failed to expand mini app:', error);
    }
  },

  /**
   * Show back button
   */
  showBackButton: (onClick: () => void): (() => void) => {
    try {
      if (backButton.isMounted()) {
        backButton.show();
        const handler = backButton.on('click', onClick);
        return () => {
          handler();
          backButton.hide();
        };
      }
    } catch (error) {
      console.error('Failed to show back button:', error);
    }
    return () => {};
  },

  /**
   * Show main button
   */
  showMainButton: (text: string, onClick: () => void): (() => void) => {
    try {
      if (mainButton.isMounted()) {
        mainButton.setText(text);
        mainButton.show();
        mainButton.enable();
        const handler = mainButton.on('click', onClick);
        return () => {
          handler();
          mainButton.hide();
        };
      }
    } catch (error) {
      console.error('Failed to show main button:', error);
    }
    return () => {};
  },

  /**
   * Trigger haptic feedback
   */
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void => {
    try {
      if (hapticFeedback.isSupported()) {
        hapticFeedback.impactOccurred(style);
      }
    } catch (error) {
      console.error('Failed to trigger haptic feedback:', error);
    }
  },

  /**
   * Trigger notification feedback
   */
  notificationOccurred: (type: 'error' | 'success' | 'warning' = 'success'): void => {
    try {
      if (hapticFeedback.isSupported()) {
        hapticFeedback.notificationOccurred(type);
      }
    } catch (error) {
      console.error('Failed to trigger notification feedback:', error);
    }
  },

  /**
   * Get viewport dimensions (non-hook version)
   */
  getViewport: (): { width: number; height: number; isExpanded: boolean } | null => {
    try {
      const state = viewport.state();
      if (!state) return null;
      return {
        width: state.width,
        height: state.height,
        isExpanded: state.isExpanded,
      };
    } catch {
      return null;
    }
  },
};

/**
 * Export for backwards compatibility during migration
 * @deprecated Use specific hooks or utilities instead
 */
export const getTelegramData = () => {
  const theme = telegramUtils.getThemeParams();
  const user = telegramUtils.getUser();
  const vp = telegramUtils.getViewport();

  if (!theme && !user && !vp) {
    return undefined;
  }

  return {
    themeParams: theme || {},
    colorScheme: theme?.colorScheme || 'light',
    user,
    viewport: vp,
    onEvent: (event: string, _callback: () => void) => {
      // Basic event simulation for backwards compatibility
      console.warn(`onEvent('${event}') called - use SDK event listeners instead`);
    },
    offEvent: (event: string, _callback: () => void) => {
      console.warn(`offEvent('${event}') called - use SDK event listeners instead`);
    },
  };
};