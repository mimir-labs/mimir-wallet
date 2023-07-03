// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Stack, Typography } from '@mui/material';
import React from 'react';

import AccountName from './AccountName';
import CopyButton from './CopyButton';
import IdentityIcon from './IdentityIcon';
import { ellipsisMixin } from './utils';

interface Props {
  value?: AccountId | AccountIndex | Address | string | null;
  withCopy?: boolean;
  shorten?: boolean;
}

function AddressMini({ shorten = false, value, withCopy }: Props) {
  return (
    <Stack alignItems='center' direction='row' spacing={0.5} sx={{ width: '100%' }}>
      <IdentityIcon size={20} value={value} />
      <Typography sx={{ ...ellipsisMixin('calc(100% - 4px - 20px)') }}>
        <AccountName shorten={shorten} value={value} />
        {withCopy && <CopyButton value={value?.toString()} />}
      </Typography>
    </Stack>
  );
}

export default React.memo(AddressMini);
