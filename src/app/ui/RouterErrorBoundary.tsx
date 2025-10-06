import { useRouteError } from 'react-router';
import { getErrorInfo } from '@/shared/api';
import { ErrorFallback } from '@/shared/ui';

export function RouterErrorBoundary() {
  const error = useRouteError();
  const errorInfo = getErrorInfo(error);

  // const handleRetry = () => {
  //   window.location.reload();
  // };

  return (
    <ErrorFallback
      message={errorInfo.message}
      // canRetry={errorInfo.canRetry}
      // onRetry={errorInfo.canRetry ? handleRetry : undefined}
    />
  );
}
