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
          <div className='bg-content1 border-divider-300 shadow-small relative w-full max-w-3xl overflow-hidden rounded-[20px] border'>
            {/* Abstract graphic design element */}
            <div className='bg-danger-500/10 absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl'></div>
            <div className='bg-danger-500/10 absolute bottom-0 left-0 h-48 w-48 -translate-x-1/3 translate-y-1/3 rounded-full blur-3xl'></div>

            {/* Header */}
            <div className='border-divider-300 relative border-b p-4 pb-6'>
              <h2 className='text-foreground text-2xl font-bold'>Something went wrong</h2>
              <p className='text-foreground/80 mt-2'>The application encountered an unexpected error({errorName})</p>
            </div>

            {/* Content */}
            <div className='relative p-4'>
              <div className='space-y-4'>
                {/* Error Message */}
                <div className='border-divider-300 overflow-hidden rounded-lg border'>
                  <div className='bg-danger-50 flex items-center px-4 py-3'>
                    <div className='bg-danger-500 mr-2 h-1.5 w-1.5 rounded-full'></div>
                    <h3 className='text-danger-700 text-sm font-medium'>Error Message</h3>
                  </div>
                  <div className='bg-content1 rounded-b-lg px-4 py-3'>
                    <div className='text-danger font-mono text-xs break-words whitespace-pre-wrap'>{errorMessage}</div>
                  </div>
                </div>

                {/* Error stack */}
                <details className='group border-divider-300 overflow-hidden rounded-lg border' open>
                  <summary className='bg-danger-50 flex cursor-pointer items-center px-4 py-3'>
                    <div className='bg-danger-500 mr-2 h-1.5 w-1.5 rounded-full'></div>
                    <h3 className='text-danger-700 text-sm font-medium'>Stack Trace</h3>
                    <div className='ml-auto'>
                      <ArrowDown className='text-danger transform transition-transform group-open:rotate-180' />
                    </div>
                  </summary>
                  <div className='bg-content1 rounded-b-lg'>
                    <pre className='text-danger max-h-64 overflow-x-auto overflow-y-auto p-4 font-mono text-xs break-words whitespace-pre-wrap'>
                      {errorStack || 'Stack trace not available'}
                    </pre>
                  </div>
                </details>

                {/* Component Stack Trace */}
                {componentStack && (
                  <details className='group border-divider-300 overflow-hidden rounded-lg border' open>
                    <summary className='bg-danger-50 flex cursor-pointer items-center px-4 py-3'>
                      <div className='bg-danger-500 mr-2 h-1.5 w-1.5 rounded-full'></div>
                      <h3 className='text-danger-700 text-sm font-medium'>Component Stack Trace</h3>
                      <div className='ml-auto'>
                        <ArrowDown className='text-danger transform transition-transform group-open:rotate-180' />
                      </div>
                    </summary>
                    <div className='bg-content1 rounded-b-lg'>
                      <pre className='text-danger max-h-64 overflow-x-auto overflow-y-auto p-4 font-mono text-xs break-words whitespace-pre-wrap'>
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
