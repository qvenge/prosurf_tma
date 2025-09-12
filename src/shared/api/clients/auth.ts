import { apiClient, validateResponse } from '../config';
import { 
  LoginRequestSchema, 
  LoginResponseSchema, 
  RefreshRequestSchema, 
  RefreshResponseSchema 
} from '../schemas';
import type { 
  LoginRequest, 
  LoginResponse, 
  RefreshRequest, 
  RefreshResponse 
} from '../types';

/**
 * Authentication API client
 * 
 * Provides methods for user authentication including login, token refresh, and logout.
 * Uses Telegram WebApp initData for authentication.
 */
export const authClient = {
  /**
   * Login with Telegram init data
   * POST /auth/login
   * 
   * @param request - Login request with Telegram initData
   * @returns Promise resolving to login response with tokens and user data
   * @example
   * ```ts
   * const response = await authClient.login({ 
   *   initData: 'telegram_init_data_string' 
   * });
   * console.log(response.user.id);
   * ```
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const validatedRequest = LoginRequestSchema.parse(request);
    const response = await apiClient.post('/auth/login', validatedRequest);
    return validateResponse(response.data, LoginResponseSchema);
  },

  /**
   * Refresh access token using refresh token
   * POST /auth/refresh
   * 
   * @param request - Refresh request with current refresh token
   * @returns Promise resolving to new access and refresh tokens
   */
  async refresh(request: RefreshRequest): Promise<RefreshResponse> {
    const validatedRequest = RefreshRequestSchema.parse(request);
    const response = await apiClient.post('/auth/refresh', validatedRequest);
    return validateResponse(response.data, RefreshResponseSchema);
  },

  /**
   * Logout and invalidate refresh token
   * POST /auth/logout
   * 
   * Invalidates the current refresh token on the server.
   * Client should clear local tokens after this call.
   * 
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};