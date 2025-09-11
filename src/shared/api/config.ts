import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
let isRefreshing = false;
let failedQueue: Array<{resolve: (token: string) => void; reject: (error: unknown) => void}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

export const setAuthTokens = (accessToken: string | null, refreshToken?: string | null) => {
  accessToken = accessToken;

  if (typeof window === 'undefined') {
    return;
  }

  if (!accessToken) {
    localStorage.removeItem('accessToken');
  } else {
    localStorage.setItem('accessToken', accessToken);
  }

  if (refreshToken != null) {
    localStorage.setItem('refreshToken', refreshToken);
  } else if (refreshToken === null) {
    localStorage.removeItem('refreshToken');
  }
};

export const getAccessToken = () => accessToken;

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers!['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      
      if (refreshToken) {
        try {
          const { authApi } = await import('./auth');
          const refreshResponse = await authApi.refreshAccessToken(refreshToken);
          
          setAuthTokens(refreshResponse.accessToken, refreshResponse.refreshToken);
          processQueue(null, refreshResponse.accessToken);
          
          originalRequest.headers!['Authorization'] = `Bearer ${refreshResponse.accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          setAuthTokens(null, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        setAuthTokens(null, null);
      }
    }
    
    return Promise.reject(error);
  }
);

export type ApiError = {
  error: string;
  message: string;
  statusCode: number;
};

export const isApiError = (error: unknown): error is AxiosError<ApiError> => {
  return error instanceof AxiosError && error.response?.data != null;
};