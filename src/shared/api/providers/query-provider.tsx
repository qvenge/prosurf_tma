import { type ReactNode, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '../query-client';

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};