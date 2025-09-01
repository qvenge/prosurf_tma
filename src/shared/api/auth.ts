import { apiClient, setAccessToken } from './config';
import { handleApiError } from './error-handler';
import {
  LoginCredentialsSchema,
  RegisterDataSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  LogoutResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  UserSchema,
  type LoginCredentials,
  type RegisterData,
  type LoginResponse,
  type LogoutRequest,
  type LogoutResponse,
  type RefreshTokenResponse,
  type User,
} from './schemas';

export const authApi = {
  register: async (data: RegisterData): Promise<User> => {
    try {
      const validatedData = RegisterDataSchema.parse(data);
      const response = await apiClient.post('/auth/register', validatedData);
      return UserSchema.parse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const validatedCredentials = LoginCredentialsSchema.parse(credentials);
      const response = await apiClient.post('/auth/login', validatedCredentials);
      const loginResponse = LoginResponseSchema.parse(response.data);
      
      setAccessToken(loginResponse.accessToken);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', loginResponse.accessToken);
        localStorage.setItem('refreshToken', loginResponse.refreshToken);
      }
      
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
      
      setAccessToken(refreshResponse.accessToken);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', refreshResponse.accessToken);
        localStorage.setItem('refreshToken', refreshResponse.refreshToken);
      }
      
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
      
      setAccessToken(null);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      
      return logoutResponse;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  initializeAuth: (): void => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        setAccessToken(token);
      }
    }
  },

  getStoredRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return 'Zm0UKsGQkqzvJXH36cL1hHN8CJTehx8K6A4IAPQwj_evv9-4HBX4QZupAzw20GRH_gjiHx3UqgVacbQ3AZizrg'
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  clearAuth: (): void => {
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
};