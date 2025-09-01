import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOTAzMDkzYS02NzU4LTRhNjctOWI1My02MzJmZmI5MjZlOTgiLCJlbWFpbCI6ImNvb3ZlbmJtQGdtYWlsLmNvbSIsImlhdCI6MTc1NjY5NTI3MSwiZXhwIjoxNzU2Njk2MTcxfQ.2ETucCsVJpKOIqz0-hT8PLV0J3a-8m_G80qEEuK-5r0';

export const setAccessToken = (token: string | null) => {
  accessToken = token;
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
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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