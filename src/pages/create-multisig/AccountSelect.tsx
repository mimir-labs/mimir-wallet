// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import React from 'react';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressRow } from '@mimir-wallet/components';

interface Props {
  title: string;
  type: 'add' | 'delete';
  accounts: string[];
  onClick: (value: string) => void;
}

function AccountSelect({ accounts, onClick, title, type }: Props) {
  return (
    <Box display='flex' flex='1' flexDirection='column'>
      <Typography fontWeight={700}>{title}</Typography>
      <Paper
        component={Stack}
        spacing={1}
        sx={{ overflowY: 'auto', maxHeight: 200, marginTop: 0.5, padding: 1, flex: 1 }}
        variant='outlined'
      >
        {accounts.map((account, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 0.5,
              padding: 0.5,
              bgcolor: 'secondary.main'
            }}
          >
            <AddressRow size='small' value={account} />
            <IconButton color={type === 'add' ? 'primary' : 'error'} onClick={() => onClick(account)} size='small'>
              <SvgIcon component={type === 'add' ? IconAdd : IconDelete} inheritViewBox />
            </IconButton>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export default React.memo(AccountSelect);
