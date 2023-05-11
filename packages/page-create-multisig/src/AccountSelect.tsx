// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import React from 'react';

import { IconAdd, IconDelete } from '@mimirdev/app-config/icons';
import { AccountMini } from '@mimirdev/react-components';

interface Props {
  title: string;
  type: 'add' | 'delete';
  accounts: string[];
  onClick: (value: string) => void;
}

function AccountSelect({ accounts, onClick, title, type }: Props) {
  return (
    <Box display='flex' flex={1} flexDirection='column'>
      <Typography fontWeight={700}>{title}</Typography>
      <Paper component={Stack} gap={1.25} sx={{ marginTop: 0.5, padding: 1.25, flex: 1 }} variant='outlined'>
        {accounts.map((account, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '5px', padding: '5px', bgcolor: 'secondary.main' }}>
            <AccountMini value={account} />
            <IconButton color={type === 'add' ? 'primary' : 'error'} onClick={() => onClick(account)}>
              {type === 'add' ? <IconAdd /> : <IconDelete />}
            </IconButton>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export default React.memo(AccountSelect);
