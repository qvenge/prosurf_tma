import { useEffect, useRef } from 'react';
import type { TelegramWebApp } from './telegram-sdk';

/**
 * Telegram WebApp event types
 */
export type TelegramEventType =
  | 'themeChanged'
  | 'viewportChanged'
  | 'mainButtonClicked'
  | 'backButtonClicked'
  | 'settingsButtonClicked'
  | 'invoiceClosed'
  | 'popupClosed'
  | 'qrTextReceived'
  | 'scanQrPopupClosed'
  | 'clipboardTextReceived'
  | 'writeAccessRequested'
  | 'contactRequested'
  | 'biometricManagerUpdated'
  | 'biometricAuthRequested'
  | 'biometricTokenUpdated'
  | 'fullscreenChanged'
  | 'fullscreenFailed'
  | 'homeScreenAdded'
  | 'homeScreenChecked'
  | 'orientationChanged'
  | 'safeAreaChanged';

/**
 * Event listener management class for Telegram WebApp
 */
export class TelegramEventManager {
  private webApp: TelegramWebApp | undefined;
  private listeners: Map<TelegramEventType, Set<() => void>>;

  constructor(webApp?: TelegramWebApp) {
    this.webApp = webApp || window.Telegram?.WebApp;
    this.listeners = new Map();
  }

  /**
   * Add an event listener
   */
  addEventListener(eventType: TelegramEventType, callback: () => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const callbacks = this.listeners.get(eventType)!;

    // If this is the first listener for this event, register with Telegram
    if (callbacks.size === 0 && this.webApp) {
      this.webApp.onEvent(eventType, this.createEventHandler(eventType));
    }

    callbacks.add(callback);
  }

  /**
   * Remove an event listener
   */
  removeEventListener(eventType: TelegramEventType, callback: () => void): void {
    const callbacks = this.listeners.get(eventType);
    if (!callbacks) return;

    callbacks.delete(callback);

    // If no more listeners, unregister from Telegram
    if (callbacks.size === 0 && this.webApp) {
      this.webApp.offEvent(eventType, this.createEventHandler(eventType));
      this.listeners.delete(eventType);
    }
  }

  /**
   * Remove all event listeners for a specific event type
   */
  removeAllListeners(eventType: TelegramEventType): void {
    const callbacks = this.listeners.get(eventType);
    if (!callbacks) return;

    callbacks.clear();

    if (this.webApp) {
      this.webApp.offEvent(eventType, this.createEventHandler(eventType));
    }

    this.listeners.delete(eventType);
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners(): void {
    for (const eventType of this.listeners.keys()) {
      this.removeAllListeners(eventType);
    }
  }

  /**
   * Check if an event has listeners
   */
  hasListeners(eventType: TelegramEventType): boolean {
    const callbacks = this.listeners.get(eventType);
    return callbacks ? callbacks.size > 0 : false;
  }

  /**
   * Get the number of listeners for an event
   */
  getListenerCount(eventType: TelegramEventType): number {
    const callbacks = this.listeners.get(eventType);
    return callbacks ? callbacks.size : 0;
  }

  /**
   * Create an event handler that calls all registered callbacks
   */
  private createEventHandler(eventType: TelegramEventType): () => void {
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error(`Error in Telegram event listener for ${eventType}:`, error);
          }
        });
      }
    };
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.removeAllEventListeners();
  }
}

// Global event manager instance
let globalEventManager: TelegramEventManager | null = null;

/**
 * Get or create the global event manager
 */
export const getGlobalEventManager = (): TelegramEventManager => {
  if (!globalEventManager) {
    globalEventManager = new TelegramEventManager();
  }
  return globalEventManager;
};

/**
 * Hook to use Telegram WebApp events with automatic cleanup
 */
export const useTelegramEvent = (
  eventType: TelegramEventType,
  callback: () => void,
  dependencies: any[] = []
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const eventManager = getGlobalEventManager();
    const handler = () => callbackRef.current();

    eventManager.addEventListener(eventType, handler);

    return () => {
      eventManager.removeEventListener(eventType, handler);
    };
  }, [eventType, ...dependencies]);
};

/**
 * Hook to listen to theme changes
 */
export const useTelegramThemeChanged = (callback: () => void) => {
  useTelegramEvent('themeChanged', callback);
};

/**
 * Hook to listen to viewport changes
 */
export const useTelegramViewportChanged = (callback: () => void) => {
  useTelegramEvent('viewportChanged', callback);
};

/**
 * Hook to listen to main button clicks
 */
export const useTelegramMainButtonClicked = (callback: () => void) => {
  useTelegramEvent('mainButtonClicked', callback);
};

/**
 * Hook to listen to back button clicks
 */
export const useTelegramBackButtonClicked = (callback: () => void) => {
  useTelegramEvent('backButtonClicked', callback);
};

/**
 * Hook to listen to settings button clicks
 */
export const useTelegramSettingsButtonClicked = (callback: () => void) => {
  useTelegramEvent('settingsButtonClicked', callback);
};

/**
 * Hook to listen to invoice closed events
 */
export const useTelegramInvoiceClosed = (callback: () => void) => {
  useTelegramEvent('invoiceClosed', callback);
};

/**
 * Hook to listen to popup closed events
 */
export const useTelegramPopupClosed = (callback: () => void) => {
  useTelegramEvent('popupClosed', callback);
};

/**
 * Hook to listen to QR text received events
 */
export const useTelegramQrTextReceived = (callback: () => void) => {
  useTelegramEvent('qrTextReceived', callback);
};

/**
 * Hook to listen to scan QR popup closed events
 */
export const useTelegramScanQrPopupClosed = (callback: () => void) => {
  useTelegramEvent('scanQrPopupClosed', callback);
};

/**
 * Hook to listen to clipboard text received events
 */
export const useTelegramClipboardTextReceived = (callback: () => void) => {
  useTelegramEvent('clipboardTextReceived', callback);
};

/**
 * Hook to listen to write access requested events
 */
export const useTelegramWriteAccessRequested = (callback: () => void) => {
  useTelegramEvent('writeAccessRequested', callback);
};

/**
 * Hook to listen to contact requested events
 */
export const useTelegramContactRequested = (callback: () => void) => {
  useTelegramEvent('contactRequested', callback);
};

/**
 * Hook to listen to biometric manager updated events
 */
export const useTelegramBiometricManagerUpdated = (callback: () => void) => {
  useTelegramEvent('biometricManagerUpdated', callback);
};

/**
 * Hook to listen to biometric auth requested events
 */
export const useTelegramBiometricAuthRequested = (callback: () => void) => {
  useTelegramEvent('biometricAuthRequested', callback);
};

/**
 * Hook to listen to biometric token updated events
 */
export const useTelegramBiometricTokenUpdated = (callback: () => void) => {
  useTelegramEvent('biometricTokenUpdated', callback);
};

/**
 * Hook to listen to fullscreen changed events
 */
export const useTelegramFullscreenChanged = (callback: () => void) => {
  useTelegramEvent('fullscreenChanged', callback);
};

/**
 * Hook to listen to fullscreen failed events
 */
export const useTelegramFullscreenFailed = (callback: () => void) => {
  useTelegramEvent('fullscreenFailed', callback);
};

/**
 * Hook to listen to home screen added events
 */
export const useTelegramHomeScreenAdded = (callback: () => void) => {
  useTelegramEvent('homeScreenAdded', callback);
};

/**
 * Hook to listen to home screen checked events
 */
export const useTelegramHomeScreenChecked = (callback: () => void) => {
  useTelegramEvent('homeScreenChecked', callback);
};

/**
 * Hook to listen to orientation changed events
 */
export const useTelegramOrientationChanged = (callback: () => void) => {
  useTelegramEvent('orientationChanged', callback);
};

/**
 * Hook to listen to safe area changed events
 */
export const useTelegramSafeAreaChanged = (callback: () => void) => {
  useTelegramEvent('safeAreaChanged', callback);
};

/**
 * Generic hook to listen to multiple events
 */
export const useTelegramEvents = (
  eventHandlers: Partial<Record<TelegramEventType, () => void>>
) => {
  const eventHandlersRef = useRef(eventHandlers);
  eventHandlersRef.current = eventHandlers;

  useEffect(() => {
    const eventManager = getGlobalEventManager();
    const handlers: Array<[TelegramEventType, () => void]> = [];

    // Register all event handlers
    Object.entries(eventHandlersRef.current).forEach(([eventType, callback]) => {
      if (callback) {
        const handler = () => callback();
        eventManager.addEventListener(eventType as TelegramEventType, handler);
        handlers.push([eventType as TelegramEventType, handler]);
      }
    });

    return () => {
      // Cleanup all handlers
      handlers.forEach(([eventType, handler]) => {
        eventManager.removeEventListener(eventType, handler);
      });
    };
  }, []);
};

/**
 * Hook to create a debounced event listener
 */
export const useTelegramEventDebounced = (
  eventType: TelegramEventType,
  callback: () => void,
  delay: number = 300,
  dependencies: any[] = []
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useTelegramEvent(
    eventType,
    () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current();
      }, delay);
    },
    dependencies
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
};

/**
 * Hook to create a throttled event listener
 */
export const useTelegramEventThrottled = (
  eventType: TelegramEventType,
  callback: () => void,
  interval: number = 100,
  dependencies: any[] = []
) => {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useTelegramEvent(
    eventType,
    () => {
      const now = Date.now();
      if (now - lastCallRef.current >= interval) {
        lastCallRef.current = now;
        callbackRef.current();
      }
    },
    dependencies
  );
};

/**
 * Utility function to trigger a custom event (for testing)
 */
export const triggerTelegramEvent = (eventType: TelegramEventType): void => {
  const eventManager = getGlobalEventManager();
  const webApp = window.Telegram?.WebApp;

  if (webApp && eventManager.hasListeners(eventType)) {
    // Manually trigger the event handler
    (eventManager as any).createEventHandler(eventType)();
  }
};

/**
 * Cleanup function to dispose of global resources
 */
export const cleanupTelegramEvents = (): void => {
  if (globalEventManager) {
    globalEventManager.dispose();
    globalEventManager = null;
  }
};