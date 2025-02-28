'use client';

import { Component, ReactNode } from 'react';
import { ErrorDisplay } from '@/app/components/ui/ErrorDisplay';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorDisplay 
        error={this.state.error} 
        resetAction={this.handleReset}
        customMessage="Something went wrong with the application"
      />;
    }

    return this.props.children;
  }
} 