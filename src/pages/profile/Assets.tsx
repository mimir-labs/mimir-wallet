// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as ExpandArrow } from '@mimir-wallet/assets/svg/expand-arrow.svg';
import { ReactComponent as IconLock } from '@mimir-wallet/assets/svg/icon-lock.svg';
import { ReactComponent as IconSend } from '@mimir-wallet/assets/svg/icon-send-fill.svg';
import { ReactComponent as IconTransfer } from '@mimir-wallet/assets/svg/icon-transfer.svg';
import { ReactComponent as IconReverse } from '@mimir-wallet/assets/svg/icon-waiting-fill.svg';
import { FormatBalance } from '@mimir-wallet/components';
import { findToken } from '@mimir-wallet/config';
import { useApi, useToggle } from '@mimir-wallet/hooks';
import { Avatar, Box, Button, IconButton, Paper, SvgIcon, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { AccountBalance } from './types';

function Row({ balances }: { balances: AccountBalance }) {
  const { api, systemChain } = useApi();

  const token = useMemo(() => findToken(api.genesisHash.toHex()), [api]);
  const [open, toggleOpen] = useToggle(true);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Avatar alt='Token' src={token.Icon} sx={{ width: 32, height: 32 }} />
        <Typography fontSize='1rem' width='20%'>
          {systemChain}
        </Typography>
        <Box sx={{ flex: '1' }}>
          <Typography variant='h6'>
            <FormatBalance value={balances.total} />
          </Typography>
        </Box>
        <Button component={Link} endIcon={<SvgIcon component={IconSend} inheritViewBox />} to='/transfer'>
          Transfer
        </Button>
        <IconButton onClick={toggleOpen} sx={{ transformOrigin: 'center', transform: `rotateZ(${open ? '0deg' : '180deg'})`, transition: 'all 150ms' }}>
          <SvgIcon color='primary' component={ExpandArrow} inheritViewBox />
        </IconButton>
      </Box>
      {open && (
        <Paper sx={{ width: '100%', marginTop: 2, bgcolor: 'secondary.main', borderRadius: 2, padding: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', '>div': { display: 'flex', gap: 0.5, alignItems: 'center', color: 'text.secondary' } }}>
            <Box>
              <SvgIcon component={IconTransfer} inheritViewBox />
              <span>Transferable</span>
              <b>
                <FormatBalance value={balances.transferrable} />
              </b>
            </Box>
            <Box>
              <SvgIcon component={IconLock} inheritViewBox />
              <span>Locked balance</span>
              <Typography color='text.primary' fontWeight={700}>
                <FormatBalance value={balances.locked} />
              </Typography>
            </Box>
            <Box>
              <SvgIcon component={IconReverse} inheritViewBox />
              <span>Reserved balance</span>
              <Typography color='text.primary' fontWeight={700}>
                <FormatBalance value={balances.reserved} />
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

function Assets({ assets }: { address?: string; assets?: AccountBalance[] }) {
  return (
    <Paper sx={{ width: '100%', borderRadius: 2, padding: 2 }}>
      {assets?.map((item, index) => (
        <Row balances={item} key={index} />
      ))}
    </Paper>
  );
}

export default React.memo(Assets);
