// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as ExpandArrow } from '@mimir-wallet/assets/svg/expand-arrow.svg';
import { Empty } from '@mimir-wallet/components';
import { useToggle } from '@mimir-wallet/hooks';
import { TxCell } from '@mimir-wallet/transactions';
import { Box, Button, Drawer, IconButton, lighten, Stack, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import { usePendingTx } from './usePendingTx';

interface Props {
  address: string;
  url: string;
}

function PendingTx({ address, url }: Props) {
  const txs = usePendingTx(address, url);
  const [expand, toggleExpand] = useToggle();

  return (
    <Drawer
      ModalProps={{
        keepMounted: true
      }}
      PaperProps={{
        sx: ({ palette }) => ({
          height: 340,
          bgcolor: lighten(palette.primary.main, 0.95),
          overflow: 'visible',
          pointerEvents: 'all !important'
        })
      }}
      anchor='bottom'
      onClose={toggleExpand}
      open={expand}
    >
      <Box
        onClick={toggleExpand}
        sx={({ palette }) => ({
          cursor: 'pointer',
          position: 'absolute',
          top: -60,
          left: 0,
          right: 0,
          visibility: 'visible',
          height: 60,
          paddingX: 2.4,
          bgcolor: lighten(palette.primary.main, 0.95),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        })}
      >
        <Typography color='primary.main' variant='h6'>
          {txs.length} Pending Transactions
        </Typography>
        <IconButton color='primary' sx={{ transition: 'all 150ms', marginLeft: 1, bgcolor: 'secondary.main', transformOrigin: 'center', transform: `rotateZ(${expand ? '180deg' : '0deg'})` }}>
          <SvgIcon component={ExpandArrow} inheritViewBox />
        </IconButton>
      </Box>
      <Stack spacing={1} sx={{ paddingX: 2.4, paddingY: 2, height: 340, marginTop: 1, overflowY: 'auto' }}>
        {txs.length > 0 ? txs.map((item) => <TxCell defaultOpen={false} key={item.uuid} transaction={item} />) : <Empty height={280} label='No Pending Transactions' />}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button component={Link} to='/transactions' variant='text'>
            View All
          </Button>
        </Box>
      </Stack>
    </Drawer>
  );
}

export default React.memo(PendingTx);
