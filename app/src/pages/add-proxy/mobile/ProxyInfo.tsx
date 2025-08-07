// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconArrow from '@/assets/svg/icon-arrow.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import { AddressCell } from '@/components';
import { ONE_DAY, ONE_HOUR } from '@/constants';
import { useBlockInterval } from '@/hooks/useBlockInterval';
import React from 'react';

import { Button } from '@mimir-wallet/ui';

function ProxyInfo({
  delay,
  proxyType,
  proxied,
  delegate,
  onDelete
}: {
  delay: number;
  proxyType: string;
  proxied?: string;
  delegate: string;
  onDelete?: () => void;
}) {
  const blockInterval = useBlockInterval().toNumber();
  const estimateTime =
    Number(delay) * blockInterval > ONE_DAY * 1000
      ? `${((Number(delay) * blockInterval) / (ONE_DAY * 1000)).toFixed(2)} Days`
      : `${((Number(delay) * blockInterval) / (ONE_HOUR * 1000)).toFixed(2)} Hours`;

  return (
    <div className='bg-secondary flex flex-col gap-1 rounded-[10px] p-2.5'>
      <div className='text-foreground/65 flex items-center gap-2.5 text-xs'>
        <p className='flex-1'>
          {delay > 0 && (
            <>
              Review Window:{' '}
              <b className='text-foreground mr-2.5'>
                {delay}
                <span className='text-primary'> ≈ {estimateTime}</span>
              </b>
            </>
          )}
          Authorize: <b className='text-foreground'>{proxyType}</b>
        </p>
        {onDelete && (
          <Button isIconOnly color='danger' size='sm' variant='light' onClick={onDelete}>
            <IconDelete />
          </Button>
        )}
      </div>

      <div className='[&>.AddressCell]:bg-content1 flex flex-col items-center gap-2.5 sm:flex-row [&>.AddressCell]:w-full [&>.AddressCell]:rounded-[10px] [&>.AddressCell]:px-2.5 [&>.AddressCell]:py-1'>
        <AddressCell withCopy value={proxied} withAddressBook />
        <IconArrow className='text-primary h-3.5 w-3.5 rotate-90 sm:transform-none' />
        <AddressCell withCopy value={delegate} withAddressBook />
      </div>
    </div>
  );
}

export default React.memo(ProxyInfo);
