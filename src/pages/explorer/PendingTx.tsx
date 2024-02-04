// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as ExpandArrow } from '@mimir-wallet/assets/svg/expand-arrow.svg';
import { Empty, TxCell } from '@mimir-wallet/components';
import { useToggle } from '@mimir-wallet/hooks';
import { Box, Button, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import { usePendingTx } from './usePendingTx';

interface Props {
  url: string;
}

function PendingTx({ url }: Props) {
  const txs = usePendingTx(url);
  const [expand, toggleExpand] = useToggle();

  return (
    <Stack spacing={1} sx={{ transition: 'all 150ms', position: 'fixed', bottom: expand ? 0 : -280, left: 0, right: 0, bgcolor: '#F5F3FF', height: 340 }}>
      <Box sx={{ height: 60, paddingX: 2.4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography color='primary.main' variant='h6'>
          {txs.length} Pending Transactions
        </Typography>
        <Box>
          <Button component={Link} to='/transactions'>
            View All
          </Button>
          <IconButton
            color='primary'
            onClick={toggleExpand}
            sx={{ transition: 'all 150ms', marginLeft: 1, bgcolor: 'secondary.main', transformOrigin: 'center', transform: `rotateZ(${expand ? '180deg' : '0deg'})` }}
          >
            <SvgIcon component={ExpandArrow} inheritViewBox />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ paddingX: 2.4, height: 280, overflowY: 'auto' }}>
        {txs.length > 0 ? txs.map((item) => <TxCell defaultOpen={false} key={item.uuid} transaction={item} />) : <Empty height={280} label='No Pending Transactions' />}
      </Box>
    </Stack>
  );
}

export default React.memo(PendingTx);
