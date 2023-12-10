// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Chip, Paper, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import { ReactComponent as IconLink } from '@mimirdev/assets/svg/icon-link.svg';
import { AddressRow } from '@mimirdev/components';
import { useSelectedAccountCallback } from '@mimirdev/hooks';
import { Transaction } from '@mimirdev/hooks/types';

function Related({ relatedTxs }: { relatedTxs: Transaction[] }) {
  const selectAccount = useSelectedAccountCallback();

  return (
    <Paper sx={{ padding: 1, bgcolor: 'secondary.main', display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
      <Typography color='text.primary' fontWeight={700}>
        Related Transaction
      </Typography>
      {relatedTxs.map((item) => (
        <Box key={item.uuid} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip color='secondary' label='Cancel' variant='filled' />
          <Typography>No.{item.uuid.slice(0, 8).toUpperCase()}</Typography>
          <AddressRow size='small' value={item.sender} withName />
          <Link onClick={() => selectAccount(item.sender)} to='/transactions'>
            <SvgIcon component={IconLink} fontSize='small' inheritViewBox sx={{ cursor: 'pointer' }} />
          </Link>
        </Box>
      ))}
    </Paper>
  );
}

export default React.memo(Related);
