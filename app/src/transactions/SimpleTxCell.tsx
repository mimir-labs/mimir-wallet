// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubscanExtrinsic } from '@/hooks/types';

import IconFailed from '@/assets/svg/icon-failed-fill.svg?react';
import IconLink from '@/assets/svg/icon-link.svg?react';
import IconSuccess from '@/assets/svg/icon-success-fill.svg?react';
import IconWaiting from '@/assets/svg/icon-waiting-fill.svg?react';
import { AppName } from '@/components';
import { CallDisplaySection } from '@/params';
import { formatAgo } from '@/utils';
import moment from 'moment';
import React, { useState } from 'react';

import { chainLinks, useChain } from '@mimir-wallet/polkadot-core';
import { Button, Tooltip } from '@mimir-wallet/ui';

interface Props {
  transaction: SubscanExtrinsic;
  network: string;
}

function TimeCell({ timestamp }: { timestamp: number }) {
  const [now] = useState(() => Date.now());
  const time = timestamp * 1000; // Convert Unix timestamp to milliseconds

  return (
    <Tooltip content={moment(time).format()}>
      <span>{now - time < 1000 ? 'Now' : `${formatAgo(time)} ago`}</span>
    </Tooltip>
  );
}

function StatusView({ success, finalized }: { success: boolean; finalized: boolean }) {
  const SvgIcon = success ? IconSuccess : IconFailed;
  const statusText = success ? 'Success' : 'Failed';
  const isPending = !finalized;

  if (isPending) {
    return (
      <div
        data-pending={true}
        className='data-[pending=true]:text-warning flex items-center gap-[5px] wrap-break-word whitespace-nowrap'
      >
        <IconWaiting color='inherit' />
        Pending
      </div>
    );
  }

  return (
    <div
      data-success={success}
      data-failed={!success}
      className='data-[success=true]:text-success data-[failed=true]:text-danger flex items-center gap-[5px] wrap-break-word whitespace-nowrap'
    >
      <SvgIcon color='inherit' />
      {statusText}
    </div>
  );
}

function SimpleTxCell({ transaction, network }: Props) {
  const chain = useChain(network);

  const explorerLink = chain ? chainLinks.extrinsicExplorerLink(chain, transaction.extrinsic_hash) : undefined;

  return (
    <div className='bg-secondary grid cursor-pointer grid-cols-10 gap-2.5 rounded-[10px] px-2.5 font-semibold sm:px-4 md:grid-cols-12 md:px-5 lg:grid-cols-15 [&>div]:flex [&>div]:h-10 [&>div]:items-center'>
      {/* App */}
      <div className='col-span-2'>
        <AppName website={null} />
      </div>

      {/* Module/Function */}
      <div className='col-span-7 md:col-span-5 lg:col-span-8'>
        <CallDisplaySection section={transaction.call_module} method={transaction.call_module_function} />
      </div>

      {/* Time (Hidden on small) */}
      <div className='col-span-2 hidden md:flex'>
        <div className='text-small text-foreground/70'>
          <TimeCell timestamp={transaction.block_timestamp} />
        </div>
      </div>

      {/* Status */}
      <div className='col-span-2 md:col-span-2 lg:col-span-2'>
        <StatusView success={transaction.success} finalized={transaction.finalized} />
      </div>

      {/* Actions */}
      <div className='col-span-1 flex justify-end'>
        {explorerLink && (
          <Button
            isIconOnly
            size='sm'
            variant='light'
            color='primary'
            onClick={() => window.open(explorerLink, '_blank')}
          >
            <IconLink className='text-primary h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  );
}

export default React.memo(SimpleTxCell);
