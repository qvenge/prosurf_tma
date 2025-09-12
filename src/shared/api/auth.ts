import { createContext, useContext } from 'react';
import { apiClient, tokenStorage, STORAGE_KEYS } from './config';
import { LoginRequestSchema, LoginResponseSchema, RefreshRequestSchema, RefreshResponseSchema, UserSchema } from './schemas';
import { validateResponse } from './config';
import type { AuthState, LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, User } from './types';

// Authentication context
export const AuthContext = createContext<AuthState & {
  login: (request: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateUser: (user: User) => void;
}>({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => { throw new Error('AuthContext not initialized'); },
  refreshTokens: async () => { throw new Error('AuthContext not initialized'); },
  updateUser: () => { throw new Error('AuthContext not initialized'); },
});

// Auth API functions
export const authApi = {
  /**
   * Login with Telegram init data
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const validatedRequest = LoginRequestSchema.parse(request);
    
    const response = await apiClient.post('/auth/login', validatedRequest);
    return validateResponse(response.data, LoginResponseSchema);
  },

  /**
   * Refresh access token using refresh token
   */
  async refresh(request: RefreshRequest): Promise<RefreshResponse> {
    const validatedRequest = RefreshRequestSchema.parse(request);
    
    const response = await apiClient.post('/auth/refresh', validatedRequest);
    return validateResponse(response.data, RefreshResponseSchema);
  },

  /**
   * Logout and invalidate refresh token
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};

// Auth utilities
export const authUtils = {
  /**
   * Initialize auth state from localStorage
   */
  initializeAuth(): AuthState {
    if (typeof window === 'undefined') {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }

    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    const userString = localStorage.getItem(STORAGE_KEYS.USER);
    
    let user: User | null = null;
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        user = UserSchema.parse(parsedUser);
      } catch (error) {
        console.error('Invalid user data in localStorage:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }

    const isAuthenticated = Boolean(accessToken && refreshToken && user);

    return {
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading: false,
    };
  },

  /**
   * Save auth data to localStorage
   */
  saveAuthData(loginResponse: LoginResponse): void {
    tokenStorage.setAccessToken(loginResponse.accessToken);
    tokenStorage.setRefreshToken(loginResponse.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loginResponse.user));
  },

  /**
   * Clear auth data from localStorage
   */
  clearAuthData(): void {
    tokenStorage.clearTokens();
  },

  /**
   * Check if access token is expired
   * Note: JWT tokens should be checked on the server side for security
   * This is just a client-side helper
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  },

  /**
   * Get user from token payload (for development/debugging)
   * In production, always fetch user data from the server
   */
  getUserFromToken(token: string): Partial<User> | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        role: payload.role,
      };
    } catch (error) {
      console.error('Error parsing token payload:', error);
      return null;
    }
  },

  /**
   * Format init data from Telegram WebApp
   */
  formatTelegramInitData(webApp: { initData?: string }): string {
    if (!webApp?.initData) {
      throw new Error('Telegram WebApp not initialized or initData not available');
    }
    return webApp.initData;
  },

  /**
   * Validate if running in Telegram WebApp environment
   */
  isTelegramWebApp(): boolean {
    return typeof window !== 'undefined' && 
           'Telegram' in window && 
           'WebApp' in (window as Record<string, unknown>).Telegram;
  },

  /**
   * Get Telegram WebApp instance if available
   */
  getTelegramWebApp(): { initData?: string } | null {
    if (this.isTelegramWebApp()) {
      return (window as Record<string, { WebApp: { initData?: string } }>).Telegram.WebApp;
    }
    return null;
  },

  /**
   * Auto-login using Telegram WebApp init data
   */
  async autoLoginWithTelegram(): Promise<LoginResponse | null> {
    if (!this.isTelegramWebApp()) {
      console.warn('Not running in Telegram WebApp environment');
      return null;
    }

    try {
      const webApp = this.getTelegramWebApp();
      const initData = this.formatTelegramInitData(webApp);
      
      return await authApi.login({ initData });
    } catch (error) {
      console.error('Auto-login with Telegram failed:', error);
      return null;
    }
  },
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth query keys for React Query
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.user(), 'profile'] as const,
} as const;

// Logout helper that can be used anywhere
export const performLogout = async (): Promise<void> => {
  try {
    await authApi.logout();
  } catch (error) {
    console.error('Logout request failed:', error);
    // Continue with local cleanup even if server request fails
  }
  
  authUtils.clearAuthData();
  
  // Redirect to login or home page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// Helper to check if user has specific role
export const hasRole = (user: User | null, role: User['role']): boolean => {
  return user?.role === role;
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

export const isUser = (user: User | null): boolean => {
  return hasRole(user, 'USER');
};

// Helper to require authentication for components
export const requireAuth = (user: User | null): User => {
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

// Helper to require admin role
export const requireAdmin = (user: User | null): User => {
  const authenticatedUser = requireAuth(user);
  if (!isAdmin(authenticatedUser)) {
    throw new Error('Admin role required');
  }
  return authenticatedUser;
};