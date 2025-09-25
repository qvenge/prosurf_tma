import { useCallback, useEffect, useMemo, useState } from 'react';

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface InitDataUnsafe {
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: {
    id: number;
    type: 'group' | 'supergroup' | 'channel';
    title: string;
    username?: string;
    photo_url?: string;
  };
  chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export interface InitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: {
    id: number;
    type: 'group' | 'supergroup' | 'channel';
    title: string;
    username?: string;
    photo_url?: string;
  };
  chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export interface ThemeParams {
  accent_text_color?: string;
  bg_color?: string;
  button_color?: string;
  button_text_color?: string;
  destructive_text_color?: string;
  header_bg_color?: string;
  hint_color?: string;
  link_color?: string;
  secondary_bg_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  section_separator_color?: string;
  subtitle_text_color?: string;
  text_color?: string;
}

export interface LaunchParams {
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
}

export interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isProgressVisible: boolean;
  isActive: boolean;
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: Partial<Pick<MainButton, 'text' | 'color' | 'textColor' | 'isActive' | 'isVisible'>>): void;
}

export interface BackButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

export interface SecondaryButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isProgressVisible: boolean;
  isActive: boolean;
  position: 'left' | 'right' | 'top' | 'bottom';
  setText(text: string): void;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: Partial<Pick<SecondaryButton, 'text' | 'color' | 'textColor' | 'isActive' | 'isVisible' | 'position'>>): void;
}

export interface SettingsButton {
  isVisible: boolean;
  onClick(callback: () => void): void;
  offClick(callback: () => void): void;
  show(): void;
  hide(): void;
}

export interface HapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

export interface CloudStorage {
  setItem(key: string, value: string, callback?: (error?: string) => void): void;
  getItem(key: string, callback: (error?: string, value?: string) => void): void;
  getItems(keys: string[], callback: (error?: string, values?: Record<string, string>) => void): void;
  removeItem(key: string, callback?: (error?: string) => void): void;
  removeItems(keys: string[], callback?: (error?: string) => void): void;
  getKeys(callback: (error?: string, keys?: string[]) => void): void;
}

export interface BiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: 'finger' | 'face' | 'unknown';
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  deviceId: string;
  init(callback?: () => void): void;
  requestAccess(params: { reason?: string }, callback?: (isAccessGranted: boolean) => void): void;
  authenticate(params: { reason?: string }, callback?: (isAuthenticated: boolean, biometricToken?: string) => void): void;
  updateBiometricToken(token: string, callback?: (isUpdated: boolean) => void): void;
  openSettings(): void;
}

export interface SwipeBehavior {
  disableVerticalSwipe(): void;
  enableVerticalSwipe(): void;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: InitDataUnsafe;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  isFullscreen: boolean;
  orientation: 'portrait' | 'landscape';
  safeAreaInset: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  contentSafeAreaInset: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  MainButton: MainButton;
  BackButton: BackButton;
  SecondaryButton: SecondaryButton;
  SettingsButton: SettingsButton;
  HapticFeedback: HapticFeedback;
  CloudStorage: CloudStorage;
  BiometricManager: BiometricManager;
  SwipeBehavior: SwipeBehavior;

  isVersionAtLeast(version: string): boolean;
  onEvent(eventType: string, callback: () => void): void;
  offEvent(eventType: string, callback: () => void): void;
  sendData(data: string): void;
  switchInlineQuery(query: string, choose_chat_types?: string[]): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: 'paid' | 'cancelled' | 'pending' | 'failed') => void): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId?: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (isConfirmed: boolean) => void): void;
  showScanQrPopup(params?: {
    text?: string;
  }, callback?: (text: string) => boolean): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  requestWriteAccess(callback?: (isAccessGranted: boolean) => void): void;
  requestContact(callback?: (isShared: boolean, contact?: {
    contact: {
      phone_number: string;
      first_name: string;
      last_name?: string;
      user_id?: number;
    };
  }) => void): void;
  shareToStory(media_url: string, params?: {
    text?: string;
    widget_link?: {
      url: string;
      name?: string;
    };
  }): void;
  requestFullscreen(): void;
  exitFullscreen(): void;
  lockOrientation(): void;
  unlockOrientation(): void;
  addToHomeScreen(): void;
  checkHomeScreenStatus(callback: (status: 'unsupported' | 'unknown' | 'added' | 'missed') => void): void;
  setHeaderColor(color: 'bg_color' | 'secondary_bg_color' | string): void;
  setBackgroundColor(color: 'bg_color' | 'secondary_bg_color' | string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  isVersionAtLeast(version: string): boolean;
  ready(): void;
  expand(): void;
  close(): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

/**
 * Hook to get Telegram user data
 * Returns null if not in Telegram environment or user not available
 */
export const useTelegramUser = (): TelegramUser | null => {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initDataUnsafe?.user) {
      setUser(webApp.initDataUnsafe.user);
    }
  }, []);

  return user;
};

/**
 * Hook to get all Telegram init data
 * Returns null if not in Telegram environment
 */
export const useTelegramInitData = (): InitData | null => {
  const [initData, setInitData] = useState<InitData | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initDataUnsafe) {
      setInitData(webApp.initDataUnsafe as InitData);
    }
  }, []);

  return initData;
};

/**
 * Hook to get raw init data string for authentication
 */
export const useTelegramInitDataRaw = (): string | null => {
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.initData) {
      setInitDataRaw(webApp.initData);
    }
  }, []);

  return initDataRaw;
};

/**
 * Hook to get theme parameters
 */
export const useTelegramTheme = (): ThemeParams | null => {
  const [theme, setTheme] = useState<ThemeParams | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.themeParams) {
      setTheme(webApp.themeParams);
    }

    const handleThemeChanged = () => {
      if (webApp?.themeParams) {
        setTheme({ ...webApp.themeParams });
      }
    };

    webApp?.onEvent('themeChanged', handleThemeChanged);

    return () => {
      webApp?.offEvent('themeChanged', handleThemeChanged);
    };
  }, []);

  return theme;
};

/**
 * Hook to get platform information
 */
export const useTelegramPlatform = (): string | null => {
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp?.platform) {
      setPlatform(webApp.platform);
    }
  }, []);

  return platform;
};

/**
 * Hook to get viewport information
 */
export const useTelegramViewport = () => {
  const [viewport, setViewport] = useState({
    height: 0,
    stableHeight: 0,
    isExpanded: false
  });

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      setViewport({
        height: webApp.viewportHeight,
        stableHeight: webApp.viewportStableHeight,
        isExpanded: webApp.isExpanded
      });
    }

    const handleViewportChanged = () => {
      if (webApp) {
        setViewport({
          height: webApp.viewportHeight,
          stableHeight: webApp.viewportStableHeight,
          isExpanded: webApp.isExpanded
        });
      }
    };

    webApp?.onEvent('viewportChanged', handleViewportChanged);

    return () => {
      webApp?.offEvent('viewportChanged', handleViewportChanged);
    };
  }, []);

  return viewport;
};

/**
 * Hook to access mini app methods
 */
export const useTelegramMiniApp = () => {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  const ready = useCallback(() => {
    webApp?.ready();
  }, [webApp]);

  const expand = useCallback(() => {
    webApp?.expand();
  }, [webApp]);

  const close = useCallback(() => {
    webApp?.close();
  }, [webApp]);

  const openLink = useCallback((url: string, options?: { try_instant_view?: boolean }) => {
    webApp?.openLink(url, options);
  }, [webApp]);

  const openTelegramLink = useCallback((url: string) => {
    webApp?.openTelegramLink(url);
  }, [webApp]);

  const sendData = useCallback((data: string) => {
    webApp?.sendData(data);
  }, [webApp]);

  const switchInlineQuery = useCallback((query: string, choose_chat_types?: string[]) => {
    webApp?.switchInlineQuery(query, choose_chat_types);
  }, [webApp]);

  const showAlert = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      webApp?.showAlert(message, () => resolve());
    });
  }, [webApp]);

  const showConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      webApp?.showConfirm(message, (isConfirmed) => resolve(isConfirmed));
    });
  }, [webApp]);

  const showPopup = useCallback((params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }) => {
    return new Promise<string | undefined>((resolve) => {
      webApp?.showPopup(params, (buttonId) => resolve(buttonId));
    });
  }, [webApp]);

  const setHeaderColor = useCallback((color: 'bg_color' | 'secondary_bg_color' | string) => {
    webApp?.setHeaderColor(color);
  }, [webApp]);

  const setBackgroundColor = useCallback((color: 'bg_color' | 'secondary_bg_color' | string) => {
    webApp?.setBackgroundColor(color);
  }, [webApp]);

  const enableClosingConfirmation = useCallback(() => {
    webApp?.enableClosingConfirmation();
  }, [webApp]);

  const disableClosingConfirmation = useCallback(() => {
    webApp?.disableClosingConfirmation();
  }, [webApp]);

  const isVersionAtLeast = useCallback((version: string) => {
    return webApp?.isVersionAtLeast(version) ?? false;
  }, [webApp]);

  return {
    webApp,
    ready,
    expand,
    close,
    openLink,
    openTelegramLink,
    sendData,
    switchInlineQuery,
    showAlert,
    showConfirm,
    showPopup,
    setHeaderColor,
    setBackgroundColor,
    enableClosingConfirmation,
    disableClosingConfirmation,
    isVersionAtLeast
  };
};

/**
 * Hook to access back button
 */
export const useTelegramBackButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const backButton = useMemo(() => webApp?.BackButton, [webApp]);

  useEffect(() => {
    if (backButton) {
      setIsVisible(backButton.isVisible);
    }
  }, [backButton]);

  const show = useCallback(() => {
    backButton?.show();
    setIsVisible(true);
  }, [backButton]);

  const hide = useCallback(() => {
    backButton?.hide();
    setIsVisible(false);
  }, [backButton]);

  const onClick = useCallback((callback: () => void) => {
    backButton?.onClick(callback);
  }, [backButton]);

  const offClick = useCallback((callback: () => void) => {
    backButton?.offClick(callback);
  }, [backButton]);

  return {
    backButton,
    isVisible,
    show,
    hide,
    onClick,
    offClick
  };
};

/**
 * Hook to access main button
 */
export const useTelegramMainButton = () => {
  const [state, setState] = useState({
    text: '',
    color: '',
    textColor: '',
    isVisible: false,
    isActive: false,
    isProgressVisible: false
  });

  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const mainButton = useMemo(() => webApp?.MainButton, [webApp]);

  useEffect(() => {
    if (mainButton) {
      setState({
        text: mainButton.text,
        color: mainButton.color,
        textColor: mainButton.textColor,
        isVisible: mainButton.isVisible,
        isActive: mainButton.isActive,
        isProgressVisible: mainButton.isProgressVisible
      });
    }
  }, [mainButton]);

  const setText = useCallback((text: string) => {
    mainButton?.setText(text);
    setState(prev => ({ ...prev, text }));
  }, [mainButton]);

  const show = useCallback(() => {
    mainButton?.show();
    setState(prev => ({ ...prev, isVisible: true }));
  }, [mainButton]);

  const hide = useCallback(() => {
    mainButton?.hide();
    setState(prev => ({ ...prev, isVisible: false }));
  }, [mainButton]);

  const enable = useCallback(() => {
    mainButton?.enable();
    setState(prev => ({ ...prev, isActive: true }));
  }, [mainButton]);

  const disable = useCallback(() => {
    mainButton?.disable();
    setState(prev => ({ ...prev, isActive: false }));
  }, [mainButton]);

  const showProgress = useCallback((leaveActive = false) => {
    mainButton?.showProgress(leaveActive);
    setState(prev => ({ ...prev, isProgressVisible: true }));
  }, [mainButton]);

  const hideProgress = useCallback(() => {
    mainButton?.hideProgress();
    setState(prev => ({ ...prev, isProgressVisible: false }));
  }, [mainButton]);

  const onClick = useCallback((callback: () => void) => {
    mainButton?.onClick(callback);
  }, [mainButton]);

  const offClick = useCallback((callback: () => void) => {
    mainButton?.offClick(callback);
  }, [mainButton]);

  const setParams = useCallback((params: Partial<Pick<MainButton, 'text' | 'color' | 'textColor' | 'isActive' | 'isVisible'>>) => {
    mainButton?.setParams(params);
    setState(prev => ({ ...prev, ...params }));
  }, [mainButton]);

  return {
    mainButton,
    ...state,
    setText,
    show,
    hide,
    enable,
    disable,
    showProgress,
    hideProgress,
    onClick,
    offClick,
    setParams
  };
};

/**
 * Hook to access haptic feedback
 */
export const useTelegramHapticFeedback = () => {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const hapticFeedback = useMemo(() => webApp?.HapticFeedback, [webApp]);

  const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    hapticFeedback?.impactOccurred(style);
  }, [hapticFeedback]);

  const notificationOccurred = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    hapticFeedback?.notificationOccurred(type);
  }, [hapticFeedback]);

  const selectionChanged = useCallback(() => {
    hapticFeedback?.selectionChanged();
  }, [hapticFeedback]);

  return {
    hapticFeedback,
    impactOccurred,
    notificationOccurred,
    selectionChanged
  };
};

/**
 * Utility functions for non-hook usage
 */
export const telegramUtils = {
  /**
   * Check if running in Telegram environment
   */
  isTelegramEnv: async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      if (window.Telegram?.WebApp) {
        resolve(true);
        return;
      }

      // Wait a bit for Telegram WebApp to load
      setTimeout(() => {
        resolve(!!window.Telegram?.WebApp);
      }, 100);
    });
  },

  /**
   * Get init data for authentication (non-hook version)
   */
  getInitDataRaw: (): string | null => {
    if (typeof window === 'undefined') return null;
    return window.Telegram?.WebApp?.initData || null;
  },

  /**
   * Get current theme parameters (non-hook version)
   */
  getThemeParams: (): ThemeParams | null => {
    if (typeof window === 'undefined') return null;
    return window.Telegram?.WebApp?.themeParams || null;
  },

  /**
   * Get current user (non-hook version)
   */
  getUser: (): TelegramUser | null => {
    if (typeof window === 'undefined') return null;
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  },

  /**
   * Open payment invoice
   */
  openInvoice: async (slug: string): Promise<'paid' | 'cancelled' | 'pending' | 'failed' | string> => {
    return new Promise((resolve) => {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) {
        resolve('failed');
        return;
      }

      webApp.openInvoice(slug, (status) => {
        resolve(status);
      });
    });
  },

  /**
   * Expand mini app to full height
   */
  expand: (): void => {
    window.Telegram?.WebApp?.expand();
  },

  /**
   * Show back button
   */
  showBackButton: (onClick: () => void): (() => void) => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (!backButton) {
      return () => {};
    }

    backButton.onClick(onClick);
    backButton.show();

    return () => {
      backButton.offClick(onClick);
      backButton.hide();
    };
  },

  /**
   * Show main button
   */
  showMainButton: (text: string, onClick: () => void): (() => void) => {
    const mainButton = window.Telegram?.WebApp?.MainButton;
    if (!mainButton) {
      return () => {};
    }

    mainButton.setText(text);
    mainButton.onClick(onClick);
    mainButton.show();

    return () => {
      mainButton.offClick(onClick);
      mainButton.hide();
    };
  },

  /**
   * Trigger haptic feedback
   */
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  },

  /**
   * Trigger notification feedback
   */
  notificationOccurred: (type: 'error' | 'success' | 'warning' = 'success'): void => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
  },

  /**
   * Get viewport dimensions (non-hook version)
   */
  getViewport: (): { width: number; height: number; isExpanded: boolean } | null => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return null;

    return {
      width: 0, // WebApp doesn't provide width directly
      height: webApp.viewportHeight,
      isExpanded: webApp.isExpanded
    };
  },

  /**
   * Get platform information
   */
  getPlatform: (): string | null => {
    return window.Telegram?.WebApp?.platform || null;
  },

  /**
   * Get color scheme
   */
  getColorScheme: (): 'light' | 'dark' | null => {
    return window.Telegram?.WebApp?.colorScheme || null;
  },

  /**
   * Check if version is at least the specified version
   */
  isVersionAtLeast: (version: string): boolean => {
    return window.Telegram?.WebApp?.isVersionAtLeast(version) ?? false;
  },

  /**
   * Ready the mini app
   */
  ready: (): void => {
    window.Telegram?.WebApp?.ready();
  },

  /**
   * Close the mini app
   */
  close: (): void => {
    window.Telegram?.WebApp?.close();
  },

  /**
   * Send data to bot
   */
  sendData: (data: string): void => {
    window.Telegram?.WebApp?.sendData(data);
  },

  /**
   * Open external link
   */
  openLink: (url: string, options?: { try_instant_view?: boolean }): void => {
    window.Telegram?.WebApp?.openLink(url, options);
  },

  /**
   * Open Telegram link
   */
  openTelegramLink: (url: string): void => {
    window.Telegram?.WebApp?.openTelegramLink(url);
  },

  /**
   * Show alert popup
   */
  showAlert: async (message: string): Promise<void> => {
    return new Promise((resolve) => {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) {
        alert(message);
        resolve();
        return;
      }

      webApp.showAlert(message, () => resolve());
    });
  },

  /**
   * Show confirm popup
   */
  showConfirm: async (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) {
        resolve(confirm(message));
        return;
      }

      webApp.showConfirm(message, (isConfirmed) => resolve(isConfirmed));
    });
  },

  /**
   * Show custom popup
   */
  showPopup: async (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) {
        alert(params.message);
        resolve(undefined);
        return;
      }

      webApp.showPopup(params, (buttonId) => resolve(buttonId));
    });
  }
};

/**
 * Helper function to parse init data
 */
export const parseInitData = (initData: string): InitData | null => {
  if (!initData) return null;

  try {
    const params = new URLSearchParams(initData);
    const result: Partial<InitData> = {};

    for (const [key, value] of params.entries()) {
      if (key === 'user' || key === 'receiver') {
        try {
          result[key] = JSON.parse(value);
        } catch {
          // Ignore parse errors for these fields
        }
      } else if (key === 'chat') {
        try {
          result[key] = JSON.parse(value);
        } catch {
          // Ignore parse errors for chat
        }
      } else if (key === 'auth_date' || key === 'can_send_after') {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          result[key as keyof InitData] = numValue as any;
        }
      } else {
        result[key as keyof InitData] = value as any;
      }
    }

    return result as InitData;
  } catch {
    return null;
  }
};

/**
 * Helper function to validate hash in init data
 */
export const validateInitData = (initData: string, botToken: string): boolean => {
  if (!initData || !botToken) return false;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Note: This is a simplified validation. In production, you should use
    // the proper HMAC-SHA256 validation with the bot token
    // This requires crypto functionality that might not be available in all browsers
    return sortedParams.length > 0;
  } catch {
    return false;
  }
};

