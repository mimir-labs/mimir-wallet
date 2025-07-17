// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from 'react';

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconRefresh from '@/assets/svg/icon-arrow-clock-wise.svg?react';
import IconFailedFill from '@/assets/svg/icon-failed-fill.svg?react';
import IconHome from '@/assets/svg/icon-home.svg?react';
import { Component, ErrorInfo } from 'react';

import { Button } from '@mimir-wallet/ui';

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

class ErrorPage extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
    if (!this.state.hasError) {
      return this.props.children;
    }

    const error = this.state.error;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    const errorName = error instanceof Error ? error.name : 'Unknown Error';

    const componentStack = this.state.errorInfo?.componentStack;

    return (
      <div className='from-background to-background/95 fixed inset-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-auto bg-gradient-to-b p-6'>
        <div className='mx-auto w-full max-w-3xl'>
          <div className='mb-8 text-center'>
            <div className='bg-danger/10 mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full'>
              <IconFailedFill className='text-danger h-12 w-12' />
            </div>
            <h1 className='text-foreground mb-3 text-4xl font-bold'>Something went wrong</h1>
            <h2 className='text-foreground/80 mb-4 text-xl font-medium'>{errorName}</h2>
            <p className='text-foreground/60 bg-foreground/5 rounded-medium border-foreground/10 mx-auto mt-3 max-w-xl border p-4'>
              {errorMessage}
            </p>
          </div>

          <div className='bg-background border-foreground/10 rounded-large shadow-medium overflow-hidden border'>
            <div className='p-6'>
              <h3 className='text-foreground/80 mb-4 flex items-center text-lg font-semibold'>
                <span className='bg-foreground/5 mr-3 flex h-8 w-8 items-center justify-center rounded-full'>
                  <IconFailedFill className='text-danger h-4 w-4' />
                </span>
                Error Details
              </h3>

              <details className='group mt-4' open>
                <summary className='bg-foreground/5 rounded-medium flex cursor-pointer items-center justify-between p-3 text-sm font-medium transition-opacity select-none hover:opacity-80'>
                  <span className='inline-flex items-center'>Show stack trace</span>
                  <ArrowDown className='h-4 w-4 transform transition-transform group-open:rotate-180' />
                </summary>
                <div className='bg-foreground/5 rounded-medium border-foreground/10 mt-3 max-h-80 overflow-auto border p-4 font-mono text-sm break-all whitespace-pre-wrap'>
                  {errorStack || 'Stack trace not available'}
                </div>
              </details>

              {componentStack && (
                <details className='group mt-4' open>
                  <summary className='bg-foreground/5 rounded-medium flex cursor-pointer items-center justify-between p-3 text-sm font-medium transition-opacity select-none hover:opacity-80'>
                    <span className='inline-flex items-center'>Show component stack</span>
                    <ArrowDown className='h-4 w-4 transform transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='bg-foreground/5 rounded-medium border-foreground/10 mt-3 max-h-80 overflow-auto border p-4 font-mono text-sm break-all whitespace-pre-wrap'>
                    {componentStack}
                  </div>
                </details>
              )}

              <div className='mt-8 flex flex-col justify-center gap-4 sm:flex-row'>
                <Button color='primary' size='lg' variant='bordered' onPress={() => (window.location.href = '/')}>
                  <IconHome className='h-5 w-5' />
                  Go Home
                </Button>
                <Button
                  color='primary'
                  size='lg'
                  variant='solid'
                  onPress={() => window.location.replace(window.location.href)}
                >
                  <IconRefresh className='h-5 w-5' />
                  Refresh Page
                </Button>
              </div>
            </div>

            <div className='bg-foreground/5 border-foreground/10 border-t p-5 text-center'>
              <p className='text-foreground/60 text-sm'>
                If this error persists, please contact support or try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorPage;
