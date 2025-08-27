import { type ReactNode, useEffect } from 'react';
import { QueryProvider } from './query-provider';
import { authApi } from '../auth';

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  useEffect(() => {
    authApi.initializeAuth();
  }, []);

  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
};