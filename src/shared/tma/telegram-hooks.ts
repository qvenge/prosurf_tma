import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  SecondaryButton
} from './telegram-sdk';

/**
 * Hook to access Telegram Cloud Storage
 * Provides key-value storage that syncs across devices
 */
export const useTelegramCloudStorage = () => {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const cloudStorage = useMemo(() => webApp?.CloudStorage, [webApp]);

  const setItem = useCallback((key: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!cloudStorage) {
        reject(new Error('Cloud storage not available'));
        return;
      }

      cloudStorage.setItem(key, value, (error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve();
        }
      });
    });
  }, [cloudStorage]);

  const getItem = useCallback((key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!cloudStorage) {
        reject(new Error('Cloud storage not available'));
        return;
      }

      cloudStorage.getItem(key, (error, value) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(value || null);
        }
      });
    });
  }, [cloudStorage]);

  const getItems = useCallback((keys: string[]): Promise<Record<string, string>> => {
    return new Promise((resolve, reject) => {
      if (!cloudStorage) {
        reject(new Error('Cloud storage not available'));
        return;
      }

      cloudStorage.getItems(keys, (error, values) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(values || {});
        }
      });
    });
  }, [cloudStorage]);

  const removeItem = useCallback((key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!cloudStorage) {
        reject(new Error('Cloud storage not available'));
        return;
      }

      cloudStorage.removeItem(key, (error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve();
        }
      });
    });
  }, [cloudStorage]);

  const removeItems = useCallback((keys: string[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!cloudStorage) {
        reject(new Error('Cloud storage not available'));
        return;
      }

      cloudStorage.removeItems(keys, (error) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve();
        }
      });
    });
  }, [cloudStorage]);

  const getKeys = useCallback((): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      if (!cloudStorage) {
        reject(new Error('Cloud storage not available'));
        return;
      }

      cloudStorage.getKeys((error, keys) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(keys || []);
        }
      });
    });
  }, [cloudStorage]);

  return {
    cloudStorage,
    setItem,
    getItem,
    getItems,
    removeItem,
    removeItems,
    getKeys,
    isAvailable: !!cloudStorage
  };
};

/**
 * Hook to access Biometric Authentication
 */
export const useTelegramBiometrics = () => {
  const [state, setState] = useState({
    isInited: false,
    isBiometricAvailable: false,
    biometricType: 'unknown' as 'finger' | 'face' | 'unknown',
    isAccessRequested: false,
    isAccessGranted: false,
    isBiometricTokenSaved: false,
    deviceId: ''
  });

  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const biometricManager = useMemo(() => webApp?.BiometricManager, [webApp]);

  useEffect(() => {
    if (biometricManager) {
      setState({
        isInited: biometricManager.isInited,
        isBiometricAvailable: biometricManager.isBiometricAvailable,
        biometricType: biometricManager.biometricType,
        isAccessRequested: biometricManager.isAccessRequested,
        isAccessGranted: biometricManager.isAccessGranted,
        isBiometricTokenSaved: biometricManager.isBiometricTokenSaved,
        deviceId: biometricManager.deviceId
      });
    }
  }, [biometricManager]);

  const init = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!biometricManager) {
        resolve();
        return;
      }

      biometricManager.init(() => {
        setState(prev => ({ ...prev, isInited: true }));
        resolve();
      });
    });
  }, [biometricManager]);

  const requestAccess = useCallback((params: { reason?: string } = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!biometricManager) {
        resolve(false);
        return;
      }

      biometricManager.requestAccess(params, (isAccessGranted) => {
        setState(prev => ({
          ...prev,
          isAccessRequested: true,
          isAccessGranted
        }));
        resolve(isAccessGranted);
      });
    });
  }, [biometricManager]);

  const authenticate = useCallback((params: { reason?: string } = {}): Promise<{ isAuthenticated: boolean; biometricToken?: string }> => {
    return new Promise((resolve) => {
      if (!biometricManager) {
        resolve({ isAuthenticated: false });
        return;
      }

      biometricManager.authenticate(params, (isAuthenticated, biometricToken) => {
        resolve({ isAuthenticated, biometricToken });
      });
    });
  }, [biometricManager]);

  const updateBiometricToken = useCallback((token: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!biometricManager) {
        resolve(false);
        return;
      }

      biometricManager.updateBiometricToken(token, (isUpdated) => {
        setState(prev => ({ ...prev, isBiometricTokenSaved: isUpdated }));
        resolve(isUpdated);
      });
    });
  }, [biometricManager]);

  const openSettings = useCallback(() => {
    biometricManager?.openSettings();
  }, [biometricManager]);

  return {
    biometricManager,
    ...state,
    init,
    requestAccess,
    authenticate,
    updateBiometricToken,
    openSettings,
    isAvailable: !!biometricManager
  };
};

/**
 * Hook to show custom popups and alerts
 */
export const useTelegramPopup = () => {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  const showPopup = useCallback((params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (!webApp) {
        alert(params.message);
        resolve(undefined);
        return;
      }

      webApp.showPopup(params, (buttonId) => resolve(buttonId));
    });
  }, [webApp]);

  const showAlert = useCallback((message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!webApp) {
        alert(message);
        resolve();
        return;
      }

      webApp.showAlert(message, () => resolve());
    });
  }, [webApp]);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!webApp) {
        resolve(confirm(message));
        return;
      }

      webApp.showConfirm(message, (isConfirmed) => resolve(isConfirmed));
    });
  }, [webApp]);

  return {
    showPopup,
    showAlert,
    showConfirm,
    isAvailable: !!webApp
  };
};

/**
 * Hook to access QR Scanner functionality
 */
export const useTelegramQRScanner = () => {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const [isScanning, setIsScanning] = useState(false);

  const showScanQrPopup = useCallback((params?: { text?: string }): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!webApp) {
        resolve(null);
        return;
      }

      setIsScanning(true);

      webApp.showScanQrPopup(params, (text) => {
        setIsScanning(false);
        // Return true to close the popup
        resolve(text);
        return true;
      });
    });
  }, [webApp]);

  const closeScanQrPopup = useCallback(() => {
    webApp?.closeScanQrPopup();
    setIsScanning(false);
  }, [webApp]);

  return {
    showScanQrPopup,
    closeScanQrPopup,
    isScanning,
    isAvailable: !!webApp
  };
};

/**
 * Hook to access Settings Button
 */
export const useTelegramSettingsButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const settingsButton = useMemo(() => webApp?.SettingsButton, [webApp]);

  useEffect(() => {
    if (settingsButton) {
      setIsVisible(settingsButton.isVisible);
    }
  }, [settingsButton]);

  const show = useCallback(() => {
    settingsButton?.show();
    setIsVisible(true);
  }, [settingsButton]);

  const hide = useCallback(() => {
    settingsButton?.hide();
    setIsVisible(false);
  }, [settingsButton]);

  const onClick = useCallback((callback: () => void) => {
    settingsButton?.onClick(callback);
  }, [settingsButton]);

  const offClick = useCallback((callback: () => void) => {
    settingsButton?.offClick(callback);
  }, [settingsButton]);

  return {
    settingsButton,
    isVisible,
    show,
    hide,
    onClick,
    offClick,
    isAvailable: !!settingsButton
  };
};

/**
 * Hook to share content to Telegram Stories
 */
export const useTelegramShareStory = () => {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  const shareToStory = useCallback((
    mediaUrl: string,
    params?: {
      text?: string;
      widget_link?: {
        url: string;
        name?: string;
      };
    }
  ) => {
    if (!webApp) return;

    webApp.shareToStory(mediaUrl, params);
  }, [webApp]);

  return {
    shareToStory,
    isAvailable: !!webApp
  };
};

/**
 * Hook to access Secondary Button
 */
export const useTelegramSecondaryButton = () => {
  const [state, setState] = useState({
    text: '',
    color: '',
    textColor: '',
    isVisible: false,
    isActive: false,
    isProgressVisible: false,
    position: 'left' as 'left' | 'right' | 'top' | 'bottom'
  });

  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const secondaryButton = useMemo(() => webApp?.SecondaryButton, [webApp]);

  useEffect(() => {
    if (secondaryButton) {
      setState({
        text: secondaryButton.text,
        color: secondaryButton.color,
        textColor: secondaryButton.textColor,
        isVisible: secondaryButton.isVisible,
        isActive: secondaryButton.isActive,
        isProgressVisible: secondaryButton.isProgressVisible,
        position: secondaryButton.position
      });
    }
  }, [secondaryButton]);

  const setText = useCallback((text: string) => {
    secondaryButton?.setText(text);
    setState(prev => ({ ...prev, text }));
  }, [secondaryButton]);

  const show = useCallback(() => {
    secondaryButton?.show();
    setState(prev => ({ ...prev, isVisible: true }));
  }, [secondaryButton]);

  const hide = useCallback(() => {
    secondaryButton?.hide();
    setState(prev => ({ ...prev, isVisible: false }));
  }, [secondaryButton]);

  const enable = useCallback(() => {
    secondaryButton?.enable();
    setState(prev => ({ ...prev, isActive: true }));
  }, [secondaryButton]);

  const disable = useCallback(() => {
    secondaryButton?.disable();
    setState(prev => ({ ...prev, isActive: false }));
  }, [secondaryButton]);

  const showProgress = useCallback((leaveActive = false) => {
    secondaryButton?.showProgress(leaveActive);
    setState(prev => ({ ...prev, isProgressVisible: true }));
  }, [secondaryButton]);

  const hideProgress = useCallback(() => {
    secondaryButton?.hideProgress();
    setState(prev => ({ ...prev, isProgressVisible: false }));
  }, [secondaryButton]);

  const onClick = useCallback((callback: () => void) => {
    secondaryButton?.onClick(callback);
  }, [secondaryButton]);

  const offClick = useCallback((callback: () => void) => {
    secondaryButton?.offClick(callback);
  }, [secondaryButton]);

  const setParams = useCallback((params: Partial<Pick<SecondaryButton, 'text' | 'color' | 'textColor' | 'isActive' | 'isVisible' | 'position'>>) => {
    secondaryButton?.setParams(params);
    setState(prev => ({ ...prev, ...params }));
  }, [secondaryButton]);

  return {
    secondaryButton,
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
    setParams,
    isAvailable: !!secondaryButton
  };
};

/**
 * Hook to control swipe behavior
 */
export const useTelegramSwipeBehavior = () => {
  const [isVerticalSwipesEnabled, setIsVerticalSwipesEnabled] = useState(true);
  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const swipeBehavior = useMemo(() => webApp?.SwipeBehavior, [webApp]);

  useEffect(() => {
    if (webApp) {
      setIsVerticalSwipesEnabled(webApp.isVerticalSwipesEnabled);
    }
  }, [webApp]);

  const disableVerticalSwipe = useCallback(() => {
    swipeBehavior?.disableVerticalSwipe();
    setIsVerticalSwipesEnabled(false);
  }, [swipeBehavior]);

  const enableVerticalSwipe = useCallback(() => {
    swipeBehavior?.enableVerticalSwipe();
    setIsVerticalSwipesEnabled(true);
  }, [swipeBehavior]);

  return {
    swipeBehavior,
    isVerticalSwipesEnabled,
    disableVerticalSwipe,
    enableVerticalSwipe,
    isAvailable: !!swipeBehavior
  };
};

/**
 * Hook to get screen orientation information
 */
export const useTelegramOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  useEffect(() => {
    if (webApp?.orientation) {
      setOrientation(webApp.orientation);
    }

    const handleOrientationChange = () => {
      if (webApp?.orientation) {
        setOrientation(webApp.orientation);
      }
    };

    // Listen for orientation changes
    webApp?.onEvent('orientationChanged', handleOrientationChange);

    return () => {
      webApp?.offEvent('orientationChanged', handleOrientationChange);
    };
  }, [webApp]);

  const lockOrientation = useCallback(() => {
    webApp?.lockOrientation();
  }, [webApp]);

  const unlockOrientation = useCallback(() => {
    webApp?.unlockOrientation();
  }, [webApp]);

  return {
    orientation,
    lockOrientation,
    unlockOrientation,
    isAvailable: !!webApp
  };
};

/**
 * Hook to get safe area insets
 */
export const useTelegramSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  const [contentSafeArea, setContentSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  useEffect(() => {
    if (webApp) {
      setSafeArea(webApp.safeAreaInset);
      setContentSafeArea(webApp.contentSafeAreaInset);
    }

    const handleSafeAreaChanged = () => {
      if (webApp) {
        setSafeArea({ ...webApp.safeAreaInset });
        setContentSafeArea({ ...webApp.contentSafeAreaInset });
      }
    };

    webApp?.onEvent('safeAreaChanged', handleSafeAreaChanged);

    return () => {
      webApp?.offEvent('safeAreaChanged', handleSafeAreaChanged);
    };
  }, [webApp]);

  return {
    safeAreaInset: safeArea,
    contentSafeAreaInset: contentSafeArea,
    isAvailable: !!webApp
  };
};

/**
 * Hook to manage WebApp ready state
 */
export const useTelegramWebAppReady = () => {
  const [isReady, setIsReady] = useState(false);
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  const ready = useCallback(() => {
    webApp?.ready();
    setIsReady(true);
  }, [webApp]);

  useEffect(() => {
    if (webApp) {
      // Auto-ready the app when the hook is first used
      ready();
    }
  }, [webApp, ready]);

  return {
    isReady,
    ready,
    isAvailable: !!webApp
  };
};

/**
 * Hook to manage fullscreen mode
 */
export const useTelegramFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  useEffect(() => {
    if (webApp) {
      setIsFullscreen(webApp.isFullscreen);
    }

    const handleFullscreenChanged = () => {
      if (webApp) {
        setIsFullscreen(webApp.isFullscreen);
      }
    };

    webApp?.onEvent('fullscreenChanged', handleFullscreenChanged);

    return () => {
      webApp?.offEvent('fullscreenChanged', handleFullscreenChanged);
    };
  }, [webApp]);

  const requestFullscreen = useCallback(() => {
    webApp?.requestFullscreen();
  }, [webApp]);

  const exitFullscreen = useCallback(() => {
    webApp?.exitFullscreen();
  }, [webApp]);

  return {
    isFullscreen,
    requestFullscreen,
    exitFullscreen,
    isAvailable: !!webApp
  };
};

/**
 * Hook to manage home screen status
 */
export const useTelegramHomeScreen = () => {
  const [status, setStatus] = useState<'unsupported' | 'unknown' | 'added' | 'missed'>('unknown');
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  const checkHomeScreenStatus = useCallback(() => {
    if (!webApp) return;

    webApp.checkHomeScreenStatus((newStatus) => {
      setStatus(newStatus);
    });
  }, [webApp]);

  const addToHomeScreen = useCallback(() => {
    webApp?.addToHomeScreen();
  }, [webApp]);

  useEffect(() => {
    checkHomeScreenStatus();
  }, [checkHomeScreenStatus]);

  return {
    status,
    checkHomeScreenStatus,
    addToHomeScreen,
    isAvailable: !!webApp
  };
};

/**
 * Hook to read from clipboard
 */
export const useTelegramClipboard = () => {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  const readTextFromClipboard = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!webApp) {
        resolve(null);
        return;
      }

      webApp.readTextFromClipboard((text) => {
        resolve(text || null);
      });
    });
  }, [webApp]);

  return {
    readTextFromClipboard,
    isAvailable: !!webApp
  };
};

/**
 * Hook to request contact sharing
 */
export const useTelegramContact = () => {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  const requestContact = useCallback((): Promise<{
    isShared: boolean;
    contact?: {
      phone_number: string;
      first_name: string;
      last_name?: string;
      user_id?: number;
    };
  }> => {
    return new Promise((resolve) => {
      if (!webApp) {
        resolve({ isShared: false });
        return;
      }

      webApp.requestContact((isShared, contact) => {
        resolve({ isShared, contact: contact?.contact });
      });
    });
  }, [webApp]);

  const requestWriteAccess = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!webApp) {
        resolve(false);
        return;
      }

      webApp.requestWriteAccess((isAccessGranted) => {
        resolve(isAccessGranted);
      });
    });
  }, [webApp]);

  return {
    requestContact,
    requestWriteAccess,
    isAvailable: !!webApp
  };
};