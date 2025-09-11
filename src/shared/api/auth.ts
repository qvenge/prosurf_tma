import { apiClient, setAuthTokens, getAccessToken } from './config';
import { handleApiError } from './error-handler';
import {
  TelegramAuthSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  LogoutResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  type TelegramAuth,
  type LoginResponse,
  type LogoutRequest,
  type LogoutResponse,
  type RefreshTokenResponse,
} from './schemas';

export const authApi = {
  authenticateWithTelegram: async (telegramAuth: TelegramAuth): Promise<LoginResponse> => {
    try {
      const validatedData = TelegramAuthSchema.parse(telegramAuth);
      const response = await apiClient.post('/auth/telegram', validatedData);
      const loginResponse = LoginResponseSchema.parse(response.data);
      
      setAuthTokens(loginResponse.accessToken, loginResponse.refreshToken);
      
      return loginResponse;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  refreshAccessToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      const validatedData = RefreshTokenRequestSchema.parse({ refreshToken });
      const response = await apiClient.post('/auth/refresh', validatedData);
      const refreshResponse = RefreshTokenResponseSchema.parse(response.data);
      
      setAuthTokens(refreshResponse.accessToken, refreshResponse.refreshToken);

      return refreshResponse;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: async (logoutData: LogoutRequest): Promise<LogoutResponse> => {
    try {
      const validatedData = LogoutRequestSchema.parse(logoutData);
      const response = await apiClient.post('/auth/logout', validatedData);
      const logoutResponse = LogoutResponseSchema.parse(response.data);
      
      setAuthTokens(null, null);

      return logoutResponse;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  initializeAuth: (): void => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const currentToken = getAccessToken();
      if (token && token !== currentToken) {
        setAuthTokens(token);
      }
    }
  },

  getStoredRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  clearAuth: (): void => {
    setAuthTokens(null, null);
  },
};