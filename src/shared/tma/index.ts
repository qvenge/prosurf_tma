/**
 * Comprehensive Telegram WebApp SDK
 *
 * This module provides a complete set of utilities, hooks, and helpers
 * for working with Telegram Mini Apps in React applications.
 *
 * @example
 * import { useTelegramUser, telegramUtils, colorUtils } from '@/shared/lib/telegram';
 *
 * // Use in your React component
 * const user = useTelegramUser();
 * const isInTelegram = await telegramUtils.isTelegramEnv();
 * colorUtils.applyTelegramThemeToDocument(themeParams);
 */

// Re-export everything from telegram-sdk
export * from './telegram-sdk';

// Re-export advanced hooks
export * from './telegram-hooks';

// Re-export event utilities
export * from './telegram-events';

// Re-export helper utilities
export * from './telegram-helpers';

// Create convenient grouped exports
export {
  // Core SDK exports
  telegramUtils,
  useTelegramUser,
  useTelegramInitData,
  useTelegramInitDataRaw,
  useTelegramTheme,
  useTelegramPlatform,
  useTelegramViewport,
  useTelegramMiniApp,
  useTelegramBackButton,
  useTelegramMainButton,
  useTelegramHapticFeedback,
  parseInitData,
  validateInitData
} from './telegram-sdk';

export {
  // Advanced hooks
  useTelegramCloudStorage,
  useTelegramBiometrics,
  useTelegramPopup,
  useTelegramQRScanner,
  useTelegramSettingsButton,
  useTelegramShareStory,
  useTelegramSecondaryButton,
  useTelegramSwipeBehavior,
  useTelegramOrientation,
  useTelegramSafeArea,
  useTelegramWebAppReady,
  useTelegramFullscreen,
  useTelegramHomeScreen,
  useTelegramClipboard,
  useTelegramContact
} from './telegram-hooks';

export {
  // Event management
  TelegramEventManager,
  getGlobalEventManager,
  useTelegramEvent,
  useTelegramEvents,
  useTelegramEventDebounced,
  useTelegramEventThrottled,

  // Specific event hooks
  useTelegramThemeChanged,
  useTelegramViewportChanged,
  useTelegramMainButtonClicked,
  useTelegramBackButtonClicked,
  useTelegramSettingsButtonClicked,
  useTelegramInvoiceClosed,
  useTelegramPopupClosed,
  useTelegramQrTextReceived,
  useTelegramScanQrPopupClosed,
  useTelegramClipboardTextReceived,
  useTelegramWriteAccessRequested,
  useTelegramContactRequested,
  useTelegramBiometricManagerUpdated,
  useTelegramBiometricAuthRequested,
  useTelegramBiometricTokenUpdated,
  useTelegramFullscreenChanged,
  useTelegramFullscreenFailed,
  useTelegramHomeScreenAdded,
  useTelegramHomeScreenChecked,
  useTelegramOrientationChanged,
  useTelegramSafeAreaChanged,

  // Event utilities
  triggerTelegramEvent,
  cleanupTelegramEvents
} from './telegram-events';

export {
  // Helper utilities grouped by category
  colorUtils,
  platformUtils,
  versionUtils,
  debugUtils,
  userUtils,
  linkUtils,
  storageUtils,
  animationUtils,
  performanceUtils,
  validationUtils,
  typeGuards
} from './telegram-helpers';

/**
 * Convenience function to initialize Telegram WebApp with all features
 *
 * @example
 * import { initializeTelegramApp } from '@/shared/lib/telegram';
 *
 * // Initialize with default settings
 * const { webApp, isReady } = await initializeTelegramApp();
 *
 * // Initialize with custom settings
 * const result = await initializeTelegramApp({
 *   applyTheme: true,
 *   enableDebug: true,
 *   autoExpand: true,
 *   enableHaptics: true
 * });
 */
export const initializeTelegramApp = async (options: {
  applyTheme?: boolean;
  enableDebug?: boolean;
  autoExpand?: boolean;
  enableHaptics?: boolean;
  readyCallback?: () => void;
} = {}) => {
  const {
    applyTheme = false,
    enableDebug = false,
    autoExpand = false,
    // enableHaptics = false, // TODO: Implement haptics initialization
    readyCallback
  } = options;

  // Import utilities dynamically to avoid circular dependencies
  const { telegramUtils } = await import('./telegram-sdk');
  const { colorUtils, debugUtils, typeGuards } = await import('./telegram-helpers');

  // Check if running in Telegram environment
  const isInTelegram = await telegramUtils.isTelegramEnv();

  if (!isInTelegram) {
    if (enableDebug) {
      debugUtils.warn('Not running in Telegram environment');
    }
    return {
      webApp: null,
      isReady: false,
      isInTelegram: false,
      error: 'Not in Telegram environment'
    };
  }

  const webApp = window.Telegram?.WebApp;

  if (!webApp || !typeGuards.isWebAppObject(webApp)) {
    return {
      webApp: null,
      isReady: false,
      isInTelegram,
      error: 'WebApp object not available'
    };
  }

  try {
    // Ready the app
    webApp.ready();

    // Auto-expand if requested
    if (autoExpand) {
      webApp.expand();
    }

    // Apply theme if requested
    if (applyTheme && webApp.themeParams) {
      colorUtils.applyTelegramThemeToDocument(webApp.themeParams);
    }

    // Enable debug mode
    if (enableDebug) {
      localStorage.setItem('tg_debug', '1');
      debugUtils.logWebAppInfo();
    }

    // Call ready callback if provided
    if (readyCallback) {
      readyCallback();
    }

    return {
      webApp,
      isReady: true,
      isInTelegram,
      version: webApp.version,
      platform: webApp.platform,
      colorScheme: webApp.colorScheme,
      user: webApp.initDataUnsafe?.user,
      themeParams: webApp.themeParams
    };

  } catch (error) {
    if (enableDebug) {
      debugUtils.error('Failed to initialize Telegram app', error);
    }

    return {
      webApp,
      isReady: false,
      isInTelegram,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * React hook for easy Telegram app initialization
 *
 * @example
 * import { useTelegramAppInit } from '@/shared/lib/telegram';
 *
 * function MyApp() {
 *   const { webApp, isReady, isInTelegram, user } = useTelegramAppInit({
 *     applyTheme: true,
 *     autoExpand: true
 *   });
 *
 *   if (!isInTelegram) {
 *     return <div>This app works only in Telegram</div>;
 *   }
 *
 *   if (!isReady) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   return <div>Welcome {user?.first_name}!</div>;
 * }
 */
export const useTelegramAppInit = (options: Parameters<typeof initializeTelegramApp>[0] = {}) => {
  const [state, setState] = React.useState<Awaited<ReturnType<typeof initializeTelegramApp>> | null>(null);

  React.useEffect(() => {
    initializeTelegramApp(options).then(setState);
  }, []);

  return state || {
    webApp: null,
    isReady: false,
    isInTelegram: false,
    error: 'Initializing...'
  };
};

// Import React for the hook
import * as React from 'react';