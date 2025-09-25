import type {
  ThemeParams,
  TelegramUser,
  InitData,
  TelegramWebApp
} from './telegram-sdk';

/**
 * Color scheme conversion utilities
 */
export const colorUtils = {
  /**
   * Convert Telegram theme color to CSS custom properties
   */
  telegramToCssVariables(themeParams: ThemeParams): Record<string, string> {
    const cssVariables: Record<string, string> = {};

    const colorMap = {
      '--tg-theme-bg-color': themeParams.bg_color,
      '--tg-theme-text-color': themeParams.text_color,
      '--tg-theme-hint-color': themeParams.hint_color,
      '--tg-theme-link-color': themeParams.link_color,
      '--tg-theme-button-color': themeParams.button_color,
      '--tg-theme-button-text-color': themeParams.button_text_color,
      '--tg-theme-secondary-bg-color': themeParams.secondary_bg_color,
      '--tg-theme-header-bg-color': themeParams.header_bg_color,
      '--tg-theme-accent-text-color': themeParams.accent_text_color,
      '--tg-theme-section-bg-color': themeParams.section_bg_color,
      '--tg-theme-section-header-text-color': themeParams.section_header_text_color,
      '--tg-theme-section-separator-color': themeParams.section_separator_color,
      '--tg-theme-subtitle-text-color': themeParams.subtitle_text_color,
      '--tg-theme-destructive-text-color': themeParams.destructive_text_color
    };

    Object.entries(colorMap).forEach(([cssVar, value]) => {
      if (value) {
        cssVariables[cssVar] = value;
      }
    });

    return cssVariables;
  },

  /**
   * Apply Telegram theme colors to document root
   */
  applyTelegramThemeToDocument(themeParams: ThemeParams): void {
    const variables = this.telegramToCssVariables(themeParams);
    const root = document.documentElement;

    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  },

  /**
   * Remove Telegram theme colors from document root
   */
  removeTelegramThemeFromDocument(): void {
    const root = document.documentElement;
    const themeProperties = [
      '--tg-theme-bg-color',
      '--tg-theme-text-color',
      '--tg-theme-hint-color',
      '--tg-theme-link-color',
      '--tg-theme-button-color',
      '--tg-theme-button-text-color',
      '--tg-theme-secondary-bg-color',
      '--tg-theme-header-bg-color',
      '--tg-theme-accent-text-color',
      '--tg-theme-section-bg-color',
      '--tg-theme-section-header-text-color',
      '--tg-theme-section-separator-color',
      '--tg-theme-subtitle-text-color',
      '--tg-theme-destructive-text-color'
    ];

    themeProperties.forEach(property => {
      root.style.removeProperty(property);
    });
  },

  /**
   * Convert hex color to RGB values
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * Get contrasting text color (black or white) for a background color
   */
  getContrastingTextColor(backgroundColor: string): '#000000' | '#ffffff' {
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';

    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
  },

  /**
   * Check if color is dark
   */
  isDarkColor(color: string): boolean {
    return this.getContrastingTextColor(color) === '#ffffff';
  },

  /**
   * Check if color is light
   */
  isLightColor(color: string): boolean {
    return !this.isDarkColor(color);
  }
};

/**
 * Platform detection utilities
 */
export const platformUtils = {
  /**
   * Check if running on iOS
   */
  isIOS(platform?: string): boolean {
    const webApp = window.Telegram?.WebApp;
    const detectedPlatform = platform || webApp?.platform;
    return detectedPlatform === 'ios';
  },

  /**
   * Check if running on Android
   */
  isAndroid(platform?: string): boolean {
    const webApp = window.Telegram?.WebApp;
    const detectedPlatform = platform || webApp?.platform;
    return detectedPlatform === 'android';
  },

  /**
   * Check if running on desktop
   */
  isDesktop(platform?: string): boolean {
    const webApp = window.Telegram?.WebApp;
    const detectedPlatform = platform || webApp?.platform;
    return ['macos', 'windows', 'linux', 'web'].includes(detectedPlatform || '');
  },

  /**
   * Check if running on web
   */
  isWeb(platform?: string): boolean {
    const webApp = window.Telegram?.WebApp;
    const detectedPlatform = platform || webApp?.platform;
    return detectedPlatform === 'web';
  },

  /**
   * Check if running on macOS
   */
  isMacOS(platform?: string): boolean {
    const webApp = window.Telegram?.WebApp;
    const detectedPlatform = platform || webApp?.platform;
    return detectedPlatform === 'macos';
  },

  /**
   * Check if running on Windows
   */
  isWindows(platform?: string): boolean {
    const webApp = window.Telegram?.WebApp;
    const detectedPlatform = platform || webApp?.platform;
    return detectedPlatform === 'windows';
  },

  /**
   * Check if running on Linux
   */
  isLinux(platform?: string): boolean {
    const webApp = window.Telegram?.WebApp;
    const detectedPlatform = platform || webApp?.platform;
    return detectedPlatform === 'linux';
  },

  /**
   * Check if device supports haptic feedback
   */
  supportsHapticFeedback(platform?: string): boolean {
    return this.isIOS(platform) || this.isAndroid(platform);
  },

  /**
   * Check if device supports biometric authentication
   */
  supportsBiometrics(platform?: string): boolean {
    const webApp = window.Telegram?.WebApp;
    return !!(webApp?.BiometricManager && (this.isIOS(platform) || this.isAndroid(platform)));
  },

  /**
   * Get platform-specific features
   */
  getPlatformFeatures(platform?: string): {
    hapticFeedback: boolean;
    biometrics: boolean;
    cloudStorage: boolean;
    qrScanner: boolean;
    homeScreenShortcut: boolean;
    fullscreen: boolean;
    orientation: boolean;
  } {
    const isIOS = this.isIOS(platform);
    const isAndroid = this.isAndroid(platform);
    const isMobile = isIOS || isAndroid;

    return {
      hapticFeedback: isMobile,
      biometrics: this.supportsBiometrics(platform),
      cloudStorage: true, // Available on all platforms
      qrScanner: isMobile,
      homeScreenShortcut: isMobile,
      fullscreen: isMobile,
      orientation: isMobile
    };
  }
};

/**
 * Version compatibility utilities
 */
export const versionUtils = {
  /**
   * Parse version string to numbers
   */
  parseVersion(version: string): number[] {
    return version.split('.').map(v => parseInt(v, 10) || 0);
  },

  /**
   * Compare two version strings
   */
  compareVersions(version1: string, version2: string): number {
    const v1Parts = this.parseVersion(version1);
    const v2Parts = this.parseVersion(version2);
    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }

    return 0;
  },

  /**
   * Check if current version is at least the specified version
   */
  isVersionAtLeast(requiredVersion: string, currentVersion?: string): boolean {
    const webApp = window.Telegram?.WebApp;
    const version = currentVersion || webApp?.version || '0.0.0';
    return this.compareVersions(version, requiredVersion) >= 0;
  },

  /**
   * Get feature availability based on version
   */
  getFeatureAvailability(currentVersion?: string): {
    mainButton: boolean;
    backButton: boolean;
    settingsButton: boolean;
    secondaryButton: boolean;
    hapticFeedback: boolean;
    cloudStorage: boolean;
    biometrics: boolean;
    qrScanner: boolean;
    popups: boolean;
    themes: boolean;
    fullscreen: boolean;
    orientation: boolean;
    safeArea: boolean;
  } {
    return {
      mainButton: this.isVersionAtLeast('6.0', currentVersion),
      backButton: this.isVersionAtLeast('6.1', currentVersion),
      settingsButton: this.isVersionAtLeast('6.10', currentVersion),
      secondaryButton: this.isVersionAtLeast('7.0', currentVersion),
      hapticFeedback: this.isVersionAtLeast('6.1', currentVersion),
      cloudStorage: this.isVersionAtLeast('6.9', currentVersion),
      biometrics: this.isVersionAtLeast('7.2', currentVersion),
      qrScanner: this.isVersionAtLeast('6.4', currentVersion),
      popups: this.isVersionAtLeast('6.2', currentVersion),
      themes: this.isVersionAtLeast('6.1', currentVersion),
      fullscreen: this.isVersionAtLeast('8.0', currentVersion),
      orientation: this.isVersionAtLeast('8.0', currentVersion),
      safeArea: this.isVersionAtLeast('7.6', currentVersion)
    };
  }
};

/**
 * Debug utilities
 */
export const debugUtils = {
  /**
   * Check if debug mode is enabled
   */
  isDebugMode(): boolean {
    return process.env.NODE_ENV === 'development' ||
           window.location.search.includes('tg_debug=1') ||
           localStorage.getItem('tg_debug') === '1';
  },

  /**
   * Log debug information
   */
  log(message: string, data?: any): void {
    if (this.isDebugMode()) {
      console.log(`[TG Debug] ${message}`, data);
    }
  },

  /**
   * Log warning
   */
  warn(message: string, data?: any): void {
    if (this.isDebugMode()) {
      console.warn(`[TG Warning] ${message}`, data);
    }
  },

  /**
   * Log error
   */
  error(message: string, error?: any): void {
    if (this.isDebugMode()) {
      console.error(`[TG Error] ${message}`, error);
    }
  },

  /**
   * Get debug information about current WebApp state
   */
  getWebAppDebugInfo(): Record<string, any> {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return { error: 'WebApp not available' };

    return {
      version: webApp.version,
      platform: webApp.platform,
      colorScheme: webApp.colorScheme,
      isExpanded: webApp.isExpanded,
      viewportHeight: webApp.viewportHeight,
      viewportStableHeight: webApp.viewportStableHeight,
      isClosingConfirmationEnabled: webApp.isClosingConfirmationEnabled,
      isVerticalSwipesEnabled: webApp.isVerticalSwipesEnabled,
      isFullscreen: webApp.isFullscreen,
      orientation: webApp.orientation,
      safeAreaInset: webApp.safeAreaInset,
      contentSafeAreaInset: webApp.contentSafeAreaInset,
      themeParams: webApp.themeParams,
      initData: webApp.initData ? '[PRESENT]' : '[NOT PRESENT]',
      initDataUnsafe: webApp.initDataUnsafe ? '[PRESENT]' : '[NOT PRESENT]',
      mainButton: {
        isVisible: webApp.MainButton.isVisible,
        isActive: webApp.MainButton.isActive,
        text: webApp.MainButton.text
      },
      backButton: {
        isVisible: webApp.BackButton.isVisible
      },
      settingsButton: webApp.SettingsButton ? {
        isVisible: webApp.SettingsButton.isVisible
      } : 'Not available',
      secondaryButton: webApp.SecondaryButton ? {
        isVisible: webApp.SecondaryButton.isVisible,
        isActive: webApp.SecondaryButton.isActive,
        text: webApp.SecondaryButton.text,
        position: webApp.SecondaryButton.position
      } : 'Not available',
      biometricManager: webApp.BiometricManager ? {
        isInited: webApp.BiometricManager.isInited,
        isBiometricAvailable: webApp.BiometricManager.isBiometricAvailable,
        biometricType: webApp.BiometricManager.biometricType,
        isAccessRequested: webApp.BiometricManager.isAccessRequested,
        isAccessGranted: webApp.BiometricManager.isAccessGranted,
        isBiometricTokenSaved: webApp.BiometricManager.isBiometricTokenSaved
      } : 'Not available'
    };
  },

  /**
   * Log debug info to console
   */
  logWebAppInfo(): void {
    if (this.isDebugMode()) {
      console.table(this.getWebAppDebugInfo());
    }
  }
};

/**
 * User utilities
 */
export const userUtils = {
  /**
   * Get user display name
   */
  getDisplayName(user: TelegramUser): string {
    if (user.username) {
      return `@${user.username}`;
    }

    if (user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }

    return user.first_name;
  },

  /**
   * Get user full name
   */
  getFullName(user: TelegramUser): string {
    if (user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name;
  },

  /**
   * Check if user is premium
   */
  isPremium(user: TelegramUser): boolean {
    return user.is_premium === true;
  },

  /**
   * Check if user is bot
   */
  isBot(user: TelegramUser): boolean {
    return user.is_bot === true;
  },

  /**
   * Get user initials
   */
  getInitials(user: TelegramUser): string {
    const firstInitial = user.first_name.charAt(0).toUpperCase();
    const lastInitial = user.last_name ? user.last_name.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  },

  /**
   * Format user language code
   */
  getLanguageName(languageCode?: string): string {
    if (!languageCode) return 'Unknown';

    const languageNames: Record<string, string> = {
      'en': 'English',
      'ru': 'Russian',
      'uk': 'Ukrainian',
      'de': 'German',
      'es': 'Spanish',
      'fr': 'French',
      'it': 'Italian',
      'pt': 'Portuguese',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'tr': 'Turkish',
      'pl': 'Polish',
      'nl': 'Dutch'
    };

    return languageNames[languageCode] || languageCode.toUpperCase();
  }
};

/**
 * URL and link utilities
 */
export const linkUtils = {
  /**
   * Check if URL is a Telegram link
   */
  isTelegramLink(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && urlObj.hostname === 't.me';
    } catch {
      return url.startsWith('tg://');
    }
  },

  /**
   * Check if URL is safe to open
   */
  isSafeUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const allowedProtocols = ['http:', 'https:', 'tg:'];
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Create a Telegram deep link
   */
  createTelegramDeepLink(path: string, params?: Record<string, string>): string {
    const baseUrl = 'https://t.me/';
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();

    return baseUrl + path + (queryString ? '?' + queryString : '');
  },

  /**
   * Create a bot start link
   */
  createBotStartLink(botUsername: string, startParam?: string): string {
    const params = startParam ? { start: startParam } : undefined;
    return this.createTelegramDeepLink(botUsername, params);
  },

  /**
   * Create a share link
   */
  createShareLink(url: string, text?: string): string {
    const params: Record<string, string> = { url };
    if (text) params.text = text;
    return this.createTelegramDeepLink('share/url', params);
  }
};

/**
 * Storage utilities for working with Telegram data
 */
export const storageUtils = {
  /**
   * Storage keys for Telegram data
   */
  keys: {
    USER_DATA: 'tg_user_data',
    THEME_PARAMS: 'tg_theme_params',
    INIT_DATA: 'tg_init_data',
    SETTINGS: 'tg_settings'
  } as const,

  /**
   * Save user data to localStorage
   */
  saveUserData(user: TelegramUser): void {
    try {
      localStorage.setItem(this.keys.USER_DATA, JSON.stringify(user));
    } catch (error) {
      debugUtils.error('Failed to save user data', error);
    }
  },

  /**
   * Load user data from localStorage
   */
  loadUserData(): TelegramUser | null {
    try {
      const data = localStorage.getItem(this.keys.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      debugUtils.error('Failed to load user data', error);
      return null;
    }
  },

  /**
   * Save theme params to localStorage
   */
  saveThemeParams(themeParams: ThemeParams): void {
    try {
      localStorage.setItem(this.keys.THEME_PARAMS, JSON.stringify(themeParams));
    } catch (error) {
      debugUtils.error('Failed to save theme params', error);
    }
  },

  /**
   * Load theme params from localStorage
   */
  loadThemeParams(): ThemeParams | null {
    try {
      const data = localStorage.getItem(this.keys.THEME_PARAMS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      debugUtils.error('Failed to load theme params', error);
      return null;
    }
  },

  /**
   * Clear all Telegram data from localStorage
   */
  clearTelegramData(): void {
    Object.values(this.keys).forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        debugUtils.error(`Failed to remove ${key}`, error);
      }
    });
  }
};

/**
 * Animation utilities for smooth transitions
 */
export const animationUtils = {
  /**
   * Animate viewport height changes
   */
  animateViewportChange(
    fromHeight: number,
    toHeight: number,
    duration: number = 300,
    onUpdate?: (height: number) => void
  ): void {
    const startTime = performance.now();
    const heightDiff = toHeight - fromHeight;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentHeight = fromHeight + (heightDiff * easeOut);

      onUpdate?.(currentHeight);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  },

  /**
   * Animate theme transition
   */
  animateThemeChange(
    fromTheme: ThemeParams,
    toTheme: ThemeParams,
    duration: number = 300,
    onUpdate?: (theme: ThemeParams) => void
  ): void {
    const startTime = performance.now();

    // Extract colors that can be animated
    const animatableProperties = [
      'bg_color', 'text_color', 'hint_color', 'link_color',
      'button_color', 'button_text_color', 'secondary_bg_color'
    ] as const;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-in-out) - for future color interpolation
      // const easeInOut = progress < 0.5
      //   ? 2 * progress * progress
      //   : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentTheme = { ...toTheme };

      // Interpolate colors (simplified - in real app you might want proper color interpolation)
      animatableProperties.forEach(prop => {
        if (fromTheme[prop] && toTheme[prop]) {
          // For simplicity, we'll just use the target theme
          // In a real implementation, you'd interpolate RGB values
          currentTheme[prop] = toTheme[prop];
        }
      });

      onUpdate?.(currentTheme);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }
};

/**
 * Performance utilities
 */
export const performanceUtils = {
  /**
   * Debounce function
   */
  debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  },

  /**
   * Throttle function
   */
  throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  },

  /**
   * Measure performance of a function
   */
  measurePerformance<T>(
    name: string,
    fn: () => T
  ): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    debugUtils.log(`Performance [${name}]: ${(end - start).toFixed(2)}ms`);

    return result;
  },

  /**
   * Create a memoized version of a function
   */
  memoize<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    getKey?: (...args: TArgs) => string
  ): (...args: TArgs) => TReturn {
    const cache = new Map<string, TReturn>();

    return (...args: TArgs): TReturn => {
      const key = getKey ? getKey(...args) : JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key)!;
      }

      const result = fn(...args);
      cache.set(key, result);

      return result;
    };
  }
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate Telegram user object
   */
  isValidTelegramUser(user: any): user is TelegramUser {
    return (
      typeof user === 'object' &&
      user !== null &&
      typeof user.id === 'number' &&
      typeof user.is_bot === 'boolean' &&
      typeof user.first_name === 'string' &&
      user.first_name.length > 0
    );
  },

  /**
   * Validate init data structure
   */
  isValidInitData(data: any): data is InitData {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.auth_date === 'number' &&
      typeof data.hash === 'string'
    );
  },

  /**
   * Validate theme params
   */
  isValidThemeParams(params: any): params is ThemeParams {
    if (typeof params !== 'object' || params === null) {
      return false;
    }

    const colorPattern = /^#[0-9a-fA-F]{6}$/;
    const optionalColorFields = [
      'accent_text_color', 'bg_color', 'button_color', 'button_text_color',
      'destructive_text_color', 'header_bg_color', 'hint_color', 'link_color',
      'secondary_bg_color', 'section_bg_color', 'section_header_text_color',
      'section_separator_color', 'subtitle_text_color', 'text_color'
    ];

    return optionalColorFields.every(field => {
      const value = params[field];
      return value === undefined || (typeof value === 'string' && colorPattern.test(value));
    });
  },

  /**
   * Validate URL
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate version string
   */
  isValidVersionString(version: string): boolean {
    const versionPattern = /^\d+(\.\d+)*$/;
    return versionPattern.test(version);
  }
};

/**
 * Type guard utilities
 */
export const typeGuards = {
  /**
   * Check if code is running in browser environment
   */
  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  },

  /**
   * Check if Telegram WebApp is available
   */
  isTelegramWebAppAvailable(): boolean {
    return this.isBrowser() && !!window.Telegram?.WebApp;
  },

  /**
   * Check if feature is available in current WebApp version
   */
  isFeatureAvailable(feature: keyof ReturnType<typeof versionUtils.getFeatureAvailability>): boolean {
    if (!this.isTelegramWebAppAvailable()) return false;

    const features = versionUtils.getFeatureAvailability();
    return features[feature];
  },

  /**
   * Runtime type check for WebApp object
   */
  isWebAppObject(obj: any): obj is TelegramWebApp {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      typeof obj.version === 'string' &&
      typeof obj.platform === 'string' &&
      typeof obj.ready === 'function' &&
      typeof obj.expand === 'function' &&
      typeof obj.close === 'function'
    );
  }
};