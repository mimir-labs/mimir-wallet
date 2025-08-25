// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FeatureError } from './error-handling';

import { Alert } from '@mimir-wallet/ui';

import { formatErrorMessage } from './error-handling';

interface ErrorDisplayProps {
  error: FeatureError | null;
  className?: string;
  showDetails?: boolean;
}

export function ErrorDisplay({ error, className, showDetails = false }: ErrorDisplayProps) {
  if (!error) return null;

  const formattedMessage = formatErrorMessage(error);

  return (
    <Alert variant='destructive' className={className} role='alert' aria-live='polite'>
      <div className='text-sm'>
        {formattedMessage}
        {showDetails && error.details && (
          <details className='mt-2'>
            <summary
              className='cursor-pointer text-xs opacity-80 hover:opacity-100 focus:opacity-100 focus:outline-2 focus:outline-offset-2'
              tabIndex={0}
            >
              Show technical details
            </summary>
            <pre
              className='mt-1 rounded bg-black/10 p-2 text-xs whitespace-pre-wrap opacity-70'
              aria-label='Error technical details'
            >
              {error.details}
            </pre>
          </details>
        )}
      </div>
    </Alert>
  );
}

/**
 * Legacy error display component for backwards compatibility
 * @deprecated Use ErrorDisplay component instead
 */
export function LegacyErrorDisplay({
  error,
  className = 'bg-secondary rounded-[10px] p-2.5 break-all'
}: {
  error: Error | null;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div className={className}>
      <div
        style={{
          fontFamily: 'Geist Mono'
        }}
        className='text-danger text-xs'
      >
        {error.message}
      </div>
    </div>
  );
}
