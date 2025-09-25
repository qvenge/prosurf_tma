// TypeScript declarations for window.Telegram interface
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
      };
    };
  }
}

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

};

/**
 * Hook to get all Telegram init data
 * Returns null if not in Telegram environment
 */
export const useTelegramInitData = (): InitData | null => {

};

/**
 * Hook to get raw init data string for authentication
 */
export const useTelegramInitDataRaw = (): string | null => {

};

/**
 * Hook to get theme parameters
 */
export const useTelegramTheme = (): ThemeParams | null => {

};

/**
 * Hook to get platform information
 */
export const useTelegramPlatform = (): string | null => {

};

/**
 * Hook to get viewport information
 */
export const useTelegramViewport = () => {

};

/**
 * Hook to access mini app methods
 */
export const useTelegramMiniApp = () => {

};

/**
 * Hook to access back button
 */
export const useTelegramBackButton = () => {

};

/**
 * Hook to access main button
 */
export const useTelegramMainButton = () => {

};

/**
 * Hook to access haptic feedback
 */
export const useTelegramHapticFeedback = () => {

};

/**
 * Utility functions for non-hook usage
 */
export const telegramUtils = {
  /**
   * Check if running in Telegram environment
   */
  isTelegramEnv: async (): Promise<boolean> => {

  },

  /**
   * Get init data for authentication (non-hook version)
   */
  getInitDataRaw: (): string | null => {

  },

  /**
   * Get current theme parameters (non-hook version)
   */
  getThemeParams: (): ThemeParams | null => {

  },

  /**
   * Get current user (non-hook version)
   */
  getUser: (): TelegramUser | null => {

  },

  /**
   * Open payment invoice
   */
  openInvoice: async (slug: string): Promise<'paid' | 'cancelled' | 'pending' | 'failed' | string> => {

  },

  /**
   * Expand mini app to full height
   */
  expand: (): void => {

  },

  /**
   * Show back button
   */
  showBackButton: (onClick: () => void): (() => void) => {

  },

  /**
   * Show main button
   */
  showMainButton: (text: string, onClick: () => void): (() => void) => {

  },

  /**
   * Trigger haptic feedback
   */
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void => {

  },

  /**
   * Trigger notification feedback
   */
  notificationOccurred: (type: 'error' | 'success' | 'warning' = 'success'): void => {

  },

  /**
   * Get viewport dimensions (non-hook version)
   */
  getViewport: (): { width: number; height: number; isExpanded: boolean } | null => {

  },
};
