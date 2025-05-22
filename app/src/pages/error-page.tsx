// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconRefresh from '@/assets/svg/icon-arrow-clock-wise.svg?react';
import IconFailedFill from '@/assets/svg/icon-failed-fill.svg?react';
import IconHome from '@/assets/svg/icon-home.svg?react';
import { useRouteError } from 'react-router-dom';

import { Button } from '@mimir-wallet/ui';

/**
 * Error boundary component specifically for router errors
 */
function ErrorPage() {
  const error = useRouteError();

  // Extract error information
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : '';
  const errorName = error instanceof Error ? error.name : 'Unknown Error';

  return (
    <div className='fixed inset-0 w-full h-full bg-gradient-to-b from-background to-background/95 flex flex-col items-center justify-center p-6 z-50 overflow-auto'>
      <div className='w-full max-w-3xl mx-auto'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-24 h-24 rounded-full bg-danger/10 mb-6'>
            <IconFailedFill className='w-12 h-12 text-danger' />
          </div>
          <h1 className='text-4xl font-bold text-foreground mb-3'>Something went wrong</h1>
          <h2 className='text-xl font-medium text-foreground/80 mb-4'>{errorName}</h2>
          <p className='mt-3 text-foreground/60 max-w-xl mx-auto bg-foreground/5 p-4 rounded-medium border border-foreground/10'>
            {errorMessage}
          </p>
        </div>

        <div className='bg-background border border-foreground/10 rounded-large shadow-medium overflow-hidden'>
          <div className='p-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center text-foreground/80'>
              <span className='flex items-center justify-center w-8 h-8 rounded-full bg-foreground/5 mr-3'>
                <IconFailedFill className='w-4 h-4 text-danger' />
              </span>
              Error Details
            </h3>

            <details className='mt-4 group' open>
              <summary className='cursor-pointer select-none font-medium text-sm hover:opacity-80 transition-opacity p-3 bg-foreground/5 rounded-medium flex items-center justify-between'>
                <span className='inline-flex items-center'>Show stack trace</span>
                <ArrowDown className='w-4 h-4 transform transition-transform group-open:rotate-180' />
              </summary>
              <div className='mt-3 overflow-auto max-h-80 font-mono p-4 bg-foreground/5 rounded-medium whitespace-pre-wrap text-sm break-all border border-foreground/10'>
                {errorStack || 'Stack trace not available'}
              </div>
            </details>

            <div className='mt-8 flex flex-col sm:flex-row justify-center gap-4'>
              <Button color='primary' size='lg' variant='bordered' onPress={() => (window.location.href = '/')}>
                <IconHome className='w-5 h-5' />
                Go Home
              </Button>
              <Button color='primary' size='lg' variant='solid' onPress={() => window.location.reload()}>
                <IconRefresh className='w-5 h-5' />
                Refresh Page
              </Button>
            </div>
          </div>

          <div className='bg-foreground/5 p-5 text-center border-t border-foreground/10'>
            <p className='text-sm text-foreground/60'>
              If this error persists, please contact support or try again later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
