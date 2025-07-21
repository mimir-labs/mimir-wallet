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
        <IconBatch className='text-primary h-[32px] w-[32px]' />
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
          base: 'flex-[0_0_auto]',
          badge: 'bottom-0.5 right-1 translate-x-0 -translate-y-0 pointer-events-none'
        }}
      >
        <Tooltip content='Batch Transactions' closeDelay={0}>
          <Button
            isIconOnly
            ref={anchorEl}
            className='border-secondary bg-secondary h-[32px] w-[32px] sm:h-[42px] sm:w-[42px] sm:bg-transparent'
            color='primary'
            variant='ghost'
            radius='md'
            onPress={toggleDrawerOpen}
          >
            <IconBatch className='h-[16px] w-[16px] sm:h-[22px] sm:w-[22px]' />
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
        <DrawerContent className='w-auto max-w-full py-5'>
          <DrawerBody>
            <Batch onClose={() => toggleDrawerOpen(false)} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default React.memo(BatchButton);
