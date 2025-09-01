import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useIsAuthenticated } from '@/shared/api';
import { Spinner } from '../spinner';

import styles from './ProtectedRoute.module.scss';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="m" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};