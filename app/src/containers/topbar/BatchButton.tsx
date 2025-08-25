// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconBatch from '@/assets/svg/icon-batch.svg?react';
import { events } from '@/events';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import React, { useEffect, useRef } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Badge, Button, Popover, PopoverContent, PopoverTrigger, Tooltip } from '@mimir-wallet/ui';

function BatchButton() {
  const { network } = useApi();
  const { current } = useAccount();
  const [txs] = useBatchTxs(network, current);
  const [isOpen, toggleOpen] = useToggle(false);
  const { openRightSidebar, closeRightSidebar, rightSidebarOpen, setRightSidebarTab } = useMimirLayout();
  const anchorEl = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const listener = (_: unknown, alert: boolean) => {
      if (alert) {
        toggleOpen(true);
      }
    };

    events.on('batch_tx_added', listener);

    return () => {
      events.off('batch_tx_added', listener);
    };
  }, [toggleOpen]);

  return (
    <>
      <Popover open={isOpen} onOpenChange={toggleOpen}>
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent>
          <div className='flex items-center gap-2.5 p-5'>
            <IconBatch className='text-primary h-[32px] w-[32px]' />
            <span>New transaction has been added to Batch</span>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default React.memo(BatchButton);
