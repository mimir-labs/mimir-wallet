// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MimirLoading } from '@/components';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

function Initializing() {
  const [showConnecting, setShowConnecting] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Show "connecting" message after 5 seconds
    const connectingTimer = setTimeout(() => {
      setShowConnecting(true);
    }, 5000);

    // Show error message after 10 seconds
    const errorTimer = setTimeout(() => {
      setShowError(true);
    }, 10000);

    return () => {
      clearTimeout(connectingTimer);
      clearTimeout(errorTimer);
    };
  }, []);

  return (
    <div
      className='absolute inset-x-0 bottom-0 flex flex-col items-center justify-center p-5'
      style={{
        background: 'var(--color-main-bg)',
        top: 56
      }}
    >
      {showError ? (
        // Error state (after 5 seconds)
        <div className='flex flex-col items-center gap-5'>
          {/* Error Icon Container */}
          <div className='flex flex-col items-center gap-5'>
            {/* Circular Background with Error Icon */}
            <div className='bg-primary relative size-[150px] shrink-0 rounded-full p-6'>
              <img
                src='/images/connection-error.png'
                alt='Connection Error'
                className='pointer-events-none size-full max-w-none object-cover object-[50%_50%]'
              />
            </div>

            {/* Title and Link */}
            <div className='text-foreground flex flex-col items-center gap-[5px] text-center'>
              <p className='shrink-0 text-[20px] leading-normal font-extrabold text-nowrap whitespace-pre'>
                Can't Connect To Endpoint
              </p>
              <p className='shrink-0 text-[14px] leading-normal font-normal text-nowrap whitespace-pre opacity-50'>
                <span>Go to </span>
                <Link
                  to='/setting'
                  search={{ type: 'general', tabs: 'network' }}
                  className='text-primary hover:underline'
                >
                  Customize RPC
                </Link>
              </p>
            </div>
          </div>

          {/* Tips */}
          <p className='text-foreground shrink-0 text-center text-[14px] leading-normal font-normal whitespace-pre opacity-50'>
            Tips: Opening too many windows connected to Polkadot may cause connection failures. You can try closing a
            few windows.
          </p>
        </div>
      ) : (
        // Loading state (0-5 seconds)
        <div className='flex flex-col items-center gap-4'>
          <MimirLoading />
          {showConnecting && (
            <Link to='/setting' search={{ type: 'general', tabs: 'network' }} className='text-primary hover:underline'>
              Go to Customize RPC
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default Initializing;
