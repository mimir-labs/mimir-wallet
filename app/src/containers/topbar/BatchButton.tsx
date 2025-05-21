// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import Batch from '@/apps/batch';
import IconBatch from '@/assets/svg/icon-batch.svg?react';
import { events } from '@/events';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { useToggle } from 'react-use';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Badge, Button, Drawer, DrawerBody, DrawerContent, FreeSoloPopover, Tooltip } from '@mimir-wallet/ui';

function BatchButton() {
  const { network } = useApi();
  const { current } = useAccount();
  const [txs] = useBatchTxs(network, current);
  const [isOpen, toggleOpen] = useToggle(false);
  const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);
  const popoverRef = useRef<HTMLDivElement>(null);
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

  const popoverContent = isOpen ? (
    <FreeSoloPopover
      isOpen
      disableDialogFocus
      onClose={() => toggleOpen(false)}
      ref={popoverRef}
      triggerRef={anchorEl}
      placement='bottom-start'
      classNames={{ content: 'rounded-medium border-1 border-divider-300 p-1' }}
    >
      <div className='flex items-center gap-2.5 p-5'>
        <IconBatch className='w-[32px] h-[32px] text-primary' />
        <span>New transaction has been added to Batch</span>
      </div>
    </FreeSoloPopover>
  ) : null;

  return (
    <>
      <Badge
        size='sm'
        isInvisible={!txs.length}
        placement='bottom-right'
        content={txs.length}
        shape='circle'
        color='primary'
        classNames={{
          badge: 'bottom-0.5 right-1 translate-x-0 -translate-y-0 pointer-events-none'
        }}
      >
        <Tooltip content='Batch Transactions' closeDelay={0}>
          <Button
            isIconOnly
            ref={anchorEl}
            className='border-secondary w-[32px] h-[32px] sm:w-[42px] sm:h-[42px] bg-secondary sm:bg-transparent'
            color='primary'
            variant='ghost'
            radius='md'
            onPress={toggleDrawerOpen}
          >
            <IconBatch className='w-[16px] h-[16px] sm:w-[22px] sm:h-[22px]' />
          </Button>
        </Tooltip>
      </Badge>

      <AnimatePresence>{popoverContent}</AnimatePresence>

      <Drawer
        hideCloseButton
        size='xl'
        placement='right'
        radius='none'
        isOpen={isDrawerOpen}
        onClose={toggleDrawerOpen}
      >
        <DrawerContent className='max-w-full w-auto py-5'>
          <DrawerBody>
            <Batch onClose={() => toggleDrawerOpen(false)} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default React.memo(BatchButton);
