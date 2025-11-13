import { apiClient, validateResponse } from '../config';
import {
  TelegramLoginDtoSchema,
  AuthResponseSchema,
  RefreshRequestSchema,
  RefreshResponseSchema,
  UserSchema,
} from '../schemas';
import type {
  TelegramLoginDto,
  AuthResponse,
  RefreshRequest,
  RefreshResponse,
  User,
} from '../types';

/**
 * Authentication API client
 *
 * Provides methods for Telegram authentication, token refresh, and logout.
 * This is a Telegram Mini App - only Telegram authentication is supported.
 */
export const authClient = {
  /**
   * Login with Telegram Web App init data
   * POST /auth/client/telegram
   *
   * @param request - Telegram login request with initData
   * @returns Promise resolving to auth response with tokens and client data
   */
  async loginWithTelegram(request: TelegramLoginDto): Promise<AuthResponse> {
    const validatedRequest = TelegramLoginDtoSchema.parse(request);
    const response = await apiClient.post('/auth/client/telegram', validatedRequest);
    return validateResponse(response.data, AuthResponseSchema);
  },

  /**
   * Get current authenticated user
   * GET /auth/me
   *
   * @returns Promise resolving to current user data
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return validateResponse(response.data, UserSchema);
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