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
    <div className='flex flex-col p-2.5 gap-1 bg-secondary rounded-medium'>
      <div className='flex items-center gap-2.5 text-foreground/65 text-tiny'>
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
          <Button isIconOnly color='danger' size='sm' variant='light' onPress={onDelete}>
            <IconDelete />
          </Button>
        )}
      </div>

      <div className='flex flex-col sm:flex-row gap-2.5 items-center [&>.AddressCell]:w-full [&>.AddressCell]:bg-content1 [&>.AddressCell]:py-1 [&>.AddressCell]:px-2.5 [&>.AddressCell]:rounded-medium'>
        <AddressCell withCopy value={proxied} withAddressBook />
        <IconArrow className='w-3.5 h-3.5 text-primary rotate-90 sm:transform-none' />
        <AddressCell withCopy value={delegate} withAddressBook />
      </div>
    </div>
  );
}

export default React.memo(ProxyInfo);
