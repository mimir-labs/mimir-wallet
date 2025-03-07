// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { AddressRow } from '@/components';
import { addressEq } from '@/utils';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { hexToU8a } from '@polkadot/util';
import React from 'react';

import { Button, Tooltip } from '@mimir-wallet/ui';

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
              <Tooltip content='The SS58 address for 0x0000000000000000000000000000000000000000000000000000000000000000 which cannot be controlled.'>
                <IconQuestion />
              </Tooltip>
            )}
            <Button
              isIconOnly
              isDisabled={disabled}
              variant='light'
              color={type === 'add' ? 'primary' : 'danger'}
              onPress={() => onClick(account)}
              size='sm'
              className='w-[26px] h-[26px] min-w-[0px] min-h-[0px]'
            >
              {type === 'add' ? <IconAdd className='w-4 h-4' /> : <IconDelete className='w-4 h-4' />}
            </Button>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export default React.memo(AccountSelect);
