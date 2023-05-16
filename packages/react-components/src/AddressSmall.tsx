// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import AccountName from './AccountName';
import CopyButton from './CopyButton';
import FormatBalance from './FormatBalance';
import IdentityIcon from './IdentityIcon';
import { ellipsisMixin } from './utils';

interface Props {
  balance?: BN;
  value?: AccountId | AccountIndex | Address | string | null;
  withBalance?: boolean;
  size?: 'small' | 'medium';
  withCopy?: boolean;
}

function AddressSmall({ balance, size = 'medium', value, withBalance, withCopy = false }: Props) {
  const [iconSize, nameFontSize, addressFontSize] = useMemo((): [number, string, string] => {
    return size === 'small' ? [20, '0.875rem', '0.75rem'] : [30, '0.875rem', '0.75rem'];
  }, [size]);

  const address = value?.toString();

  return (
    <Stack alignItems='center' direction='row' spacing={1}>
      <IdentityIcon className='AddressSmall-Icon' size={iconSize} value={value} />
      <Stack className='AddressSmall-Address' spacing={0.25} sx={{ '>p': { ...ellipsisMixin() } }}>
        <Typography fontSize={nameFontSize} fontWeight={700}>
          <AccountName value={value} />
        </Typography>
        <Typography color='text.secondary' fontSize={addressFontSize}>
          {address?.slice(0, 6)}...{address?.slice(-6)}
          {withCopy && <CopyButton value={address} />}
        </Typography>
        <Typography color='text.secondary' fontSize={addressFontSize} fontWeight={700}>
          {withBalance && <FormatBalance value={balance} />}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default React.memo(AddressSmall);
