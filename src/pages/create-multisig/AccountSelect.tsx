// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, IconButton, Paper, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { hexToU8a } from '@polkadot/util';
import React from 'react';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import IconQuestion from '@mimir-wallet/assets/svg/icon-question-fill.svg?react';
import { AddressRow } from '@mimir-wallet/components';
import { addressEq } from '@mimir-wallet/utils';

interface Props {
  title: string;
  type: 'add' | 'delete';
  disabled?: boolean;
  accounts: string[];
  onClick: (value: string) => void;
}

function AccountSelect({ accounts, disabled, onClick, title, type }: Props) {
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
              bgcolor: 'secondary.main',
              '& > .AddressRow': {
                flex: '1'
              }
            }}
          >
            <AddressRow iconSize={24} value={account} />
            {addressEq(hexToU8a('0x0', 256), account) && (
              <Tooltip title='The SS58 address for 0x0000000000000000000000000000000000000000000000000000000000000000 which cannot be controlled.'>
                <SvgIcon color='primary' component={IconQuestion} inheritViewBox sx={{ opacity: 0.5 }} />
              </Tooltip>
            )}
            <IconButton
              disabled={disabled}
              color={type === 'add' ? 'primary' : 'error'}
              onClick={() => onClick(account)}
              size='small'
            >
              <SvgIcon component={type === 'add' ? IconAdd : IconDelete} inheritViewBox fontSize='inherit' />
            </IconButton>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export default React.memo(AccountSelect);
