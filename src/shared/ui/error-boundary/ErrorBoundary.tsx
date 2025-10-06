import { Component, type ReactNode } from 'react';
import { logError, getErrorInfo } from '@/shared/api';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    logError(error, `Component Stack: ${errorInfo.componentStack}`);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const errorInfo = getErrorInfo(this.state.error);

      return (
        <ErrorFallback
          message={errorInfo.message}
        />
      );
    }

    return this.props.children;
  }
}
