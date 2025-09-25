import { apiClient, validateResponse } from '../config';
import {
  TelegramLoginDtoSchema,
  LoginDtoSchema,
  RegisterDtoSchema,
  AuthResponseSchema,
  RefreshRequestSchema,
  RefreshResponseSchema,
  // Legacy schemas for backward compatibility
  LoginRequestSchema,
  LoginResponseSchema
} from '../schemas';
import type {
  TelegramLoginDto,
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshRequest,
  RefreshResponse,
  // Legacy types for backward compatibility
  LoginRequest,
  LoginResponse
} from '../types';

/**
 * Authentication API client
 *
 * Provides methods for user authentication including Telegram, email/username login,
 * user registration, token refresh, and logout.
 */
export const authClient = {
  /**
   * Login with Telegram Web App init data
   * POST /auth/telegram
   *
   * @param request - Telegram login request with initData
   * @returns Promise resolving to auth response with tokens and user data
   */
  async loginWithTelegram(request: TelegramLoginDto): Promise<AuthResponse> {
    const validatedRequest = TelegramLoginDtoSchema.parse(request);
    const response = await apiClient.post('/auth/telegram', validatedRequest);
    return validateResponse(response.data, AuthResponseSchema);
  },

  /**
   * Login with email/username and password
   * POST /auth/login
   *
   * @param request - Login request with email/username and password
   * @returns Promise resolving to auth response with tokens and user data
   */
  async loginWithCredentials(request: LoginDto): Promise<AuthResponse> {
    const validatedRequest = LoginDtoSchema.parse(request);
    const response = await apiClient.post('/auth/login', validatedRequest);
    return validateResponse(response.data, AuthResponseSchema);
  },

  /**
   * Register new user
   * POST /auth/register
   *
   * @param request - Registration request with user data
   * @returns Promise resolving to auth response with tokens and user data
   */
  async register(request: RegisterDto): Promise<AuthResponse> {
    const validatedRequest = RegisterDtoSchema.parse(request);
    const response = await apiClient.post('/auth/register', validatedRequest);
    return validateResponse(response.data, AuthResponseSchema);
  },

  /**
   * Legacy login method (Telegram init data)
   * POST /auth/login
   *
   * @deprecated Use loginWithTelegram instead
   * @param request - Login request with Telegram initData
   * @returns Promise resolving to login response with tokens and user data
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