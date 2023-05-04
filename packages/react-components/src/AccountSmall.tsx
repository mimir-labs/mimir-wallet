// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { Stack, Typography } from '@mui/material';
import React from 'react';

import AccountName from './AccountName';
import FormatBalance from './FormatBalance';
import IdentityIcon from './IdentityIcon';
import { ellipsisMixin } from './utils';

interface Props {
  balance?: BN;
  value?: AccountId | AccountIndex | Address | string | null;
  withBalance?: boolean;
}

function AccountSmall({ balance, value, withBalance }: Props) {
  return (
    <Stack alignItems='center' direction='row' spacing={1} sx={{ width: '100%' }}>
      <IdentityIcon size={30} value={value} />
      <Stack
        spacing={0.25}
        sx={{
          width: 'calc(100% - 10px - 30px)',
          '>p': {
            ...ellipsisMixin()
          }
        }}
      >
        <Typography fontWeight={700}>
          <AccountName value={value} />
        </Typography>
        <Typography color='text.secondary' fontSize='0.75rem'>
          {value?.toString()}
        </Typography>
        <Typography color='text.secondary' fontWeight={700}>
          {withBalance && <FormatBalance value={balance} />}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default React.memo(AccountSmall);
