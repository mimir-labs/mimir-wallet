// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconBatch from '@/assets/svg/icon-batch.svg?react';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import React, { useRef } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Badge, Button, Tooltip } from '@mimir-wallet/ui';

function BatchButton() {
  const { network } = useApi();
  const { current } = useAccount();
  const [txs] = useBatchTxs(network, current);
  const { openRightSidebar, closeRightSidebar, rightSidebarOpen, setRightSidebarTab } = useMimirLayout();
  const anchorEl = useRef<HTMLButtonElement>(null);

  return (
    <Badge
      size='sm'
      isInvisible={!txs.length}
      isOneChar
      content={txs.length}
      shape='circle'
      color='primary'
      classNames={{
        base: 'flex-[0_0_auto]',
        badge: 'bottom-0.5 right-1 translate-x-0 -translate-y-0 pointer-events-none'
      }}
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
            rightSidebarOpen ? closeRightSidebar() : openRightSidebar();
          }}
        >
          <IconBatch className='h-[16px] w-[16px] sm:h-[22px] sm:w-[22px]' />
        </Button>
      </Tooltip>
    </Badge>
  );
}

export default React.memo(BatchButton);
