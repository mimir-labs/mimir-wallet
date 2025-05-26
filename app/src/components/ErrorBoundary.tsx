// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import { Component, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Call the optional onError callback
    this.props.onError?.(error, errorInfo);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      const error = this.state.error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      const errorName = error instanceof Error ? error.name : 'Unknown Error';

      const componentStack = this.state.errorInfo?.componentStack;

      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className='w-full max-w-3xl relative bg-content1 rounded-large shadow-small overflow-hidden border border-divider-300'>
            {/* Abstract graphic design element */}
            <div className='absolute top-0 right-0 w-64 h-64 bg-danger-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl'></div>
            <div className='absolute bottom-0 left-0 w-48 h-48 bg-danger-500/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl'></div>

            {/* Header */}
            <div className='relative p-4 pb-6 border-b border-divider-300'>
              <h2 className='text-2xl font-bold text-foreground'>Something went wrong</h2>
              <p className='mt-2 text-foreground/80'>The application encountered an unexpected error({errorName})</p>
            </div>

            {/* Content */}
            <div className='p-4 relative'>
              <div className='space-y-4'>
                {/* Error Message */}
                <div className='rounded-lg overflow-hidden border border-divider-300'>
                  <div className='bg-danger-50 px-4 py-3 flex items-center'>
                    <div className='w-1.5 h-1.5 bg-danger-500 rounded-full mr-2'></div>
                    <h3 className='text-sm font-medium text-danger-700'>Error Message</h3>
                  </div>
                  <div className='bg-content1 rounded-b-lg px-4 py-3'>
                    <div className='font-mono text-tiny text-danger whitespace-pre-wrap break-words'>
                      {errorMessage}
                    </div>
                  </div>
                </div>

                {/* Error stack */}
                <details className='rounded-lg overflow-hidden group border border-divider-300' open>
                  <summary className='bg-danger-50 px-4 py-3 flex items-center cursor-pointer'>
                    <div className='w-1.5 h-1.5 bg-danger-500 rounded-full mr-2'></div>
                    <h3 className='text-sm font-medium text-danger-700'>Stack Trace</h3>
                    <div className='ml-auto'>
                      <ArrowDown className='text-danger transform transition-transform group-open:rotate-180' />
                    </div>
                  </summary>
                  <div className='bg-content1 rounded-b-lg'>
                    <pre className='font-mono text-tiny text-danger p-4 overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto'>
                      {errorStack || 'Stack trace not available'}
                    </pre>
                  </div>
                </details>

                {/* Component Stack Trace */}
                {componentStack && (
                  <details className='rounded-lg overflow-hidden group border border-divider-300' open>
                    <summary className='bg-danger-50 px-4 py-3 flex items-center cursor-pointer'>
                      <div className='w-1.5 h-1.5 bg-danger-500 rounded-full mr-2'></div>
                      <h3 className='text-sm font-medium text-danger-700'>Component Stack Trace</h3>
                      <div className='ml-auto'>
                        <ArrowDown className='text-danger transform transition-transform group-open:rotate-180' />
                      </div>
                    </summary>
                    <div className='bg-content1 rounded-b-lg'>
                      <pre className='font-mono text-tiny text-danger p-4 overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto'>
                        {componentStack}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
