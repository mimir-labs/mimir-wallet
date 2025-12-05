// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNetwork } from '@mimir-wallet/polkadot-core';
import { BadgeIndicator, Button, Tooltip } from '@mimir-wallet/ui';
import React, { useRef } from 'react';

import { useAccount } from '@/accounts/useAccount';
import { analyticsActions } from '@/analytics';
import IconBatch from '@/assets/svg/icon-batch.svg?react';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { useMimirLayout } from '@/hooks/useMimirLayout';

function BatchButton() {
  const { network } = useNetwork();
  const { current } = useAccount();

  const [txs] = useBatchTxs(network, current);
  const { openRightSidebar, closeRightSidebar, rightSidebarOpen, setRightSidebarTab } = useMimirLayout();
  const anchorEl = useRef<HTMLButtonElement>(null);

  return (
    <BadgeIndicator
      isInvisible={!txs.length}
      content={txs.length}
      color='primary'
      placement='bottom-right'
      className='shrink-0'
      badgeClassName='bottom-0.5 right-1 translate-x-0 -translate-y-0'
    >
      <Tooltip content='Batch Transactions'>
        <Button
          isIconOnly
          ref={anchorEl}
          className='border-secondary bg-secondary h-[32px] w-[32px] sm:h-[42px] sm:w-[42px] sm:bg-transparent'
          color='primary'
          variant='ghost'
          radius='md'
          onClick={() => {
            setRightSidebarTab('batch');

            // Track batch started when opening
            analyticsActions.batchStarted(txs.length);

            rightSidebarOpen ? closeRightSidebar() : openRightSidebar();
          }}
        >
          <IconBatch className='h-[16px] w-[16px] sm:h-[22px] sm:w-[22px]' />
        </Button>
      </Tooltip>
    </BadgeIndicator>
  );
}

export default React.memo(BatchButton);
