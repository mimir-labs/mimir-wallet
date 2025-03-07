// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import Batch from '@/apps/batch';
import IconBatch from '@/assets/svg/icon-batch.svg?react';
import { events } from '@/events';
import { useBatchTxs } from '@/hooks/useBatchTxs';
import { Badge, Box, Drawer, Popover, SvgIcon } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useToggle } from 'react-use';

import { Button, Tooltip } from '@mimir-wallet/ui';

function BatchButton() {
  const { current } = useAccount();
  const [txs] = useBatchTxs(current);
  const [isOpen, toggleOpen] = useToggle(false);
  const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);
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
      <Badge
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        badgeContent={txs.length}
        color='primary'
        max={9}
        sx={{
          '.MuiBadge-badge': {
            pointerEvents: 'none',
            fontSize: 10,
            minWidth: 14,
            width: 14,
            height: 14,
            borderRadius: '8px',
            transform: 'scale(1) translate(0%, 0%)'
          }
        }}
      >
        <Tooltip content='Batch' closeDelay={0}>
          <Button
            isIconOnly
            ref={anchorEl}
            className='border-secondary'
            color='primary'
            variant='ghost'
            radius='md'
            onPress={toggleDrawerOpen}
          >
            <IconBatch />
          </Button>
        </Tooltip>
      </Badge>

      <Popover
        open={isOpen}
        onClose={() => toggleOpen(false)}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, padding: 2 }}>
          <SvgIcon inheritViewBox component={IconBatch} sx={{ color: 'primary.main', width: 32, height: 32 }} />
          <span>New transaction has been added to Batch</span>
        </Box>
      </Popover>

      <Drawer anchor='right' open={isDrawerOpen} onClose={() => toggleDrawerOpen(false)}>
        <Batch onClose={() => toggleDrawerOpen(false)} />
      </Drawer>
    </>
  );
}

export default React.memo(BatchButton);
