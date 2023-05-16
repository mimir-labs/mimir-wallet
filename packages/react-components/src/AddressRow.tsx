// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { Box, Chip, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import AccountName from './AccountName';
import CopyButton from './CopyButton';
import FormatBalance from './FormatBalance';
import IdentityIcon from './IdentityIcon';
import { getAddressMeta } from './utils';

interface Props {
  balance?: Compact<any> | BN | string | number | null;
  value?: AccountId | AccountIndex | Address | string | null;
  withBalance?: boolean;
  size?: 'small' | 'medium' | 'large';
}

function AddressRow({ balance, size = 'medium', value, withBalance }: Props) {
  const meta = useMemo(() => (value ? getAddressMeta(value.toString()) : null), [value]);

  const label = useMemo(() => {
    if (meta) {
      return meta.isMultisig ? `Multisig ${meta.threshold}/${(meta.who as any)?.length}` : meta.isInjected ? 'Injected' : meta.isTesting ? 'Development' : null;
    }

    return null;
  }, [meta]);

  const [iconSize, nameFontSize, addressFontSize] = useMemo((): [number, string, string] => {
    return size === 'small' ? [30, '0.875rem', '0.75rem'] : size === 'medium' ? [40, '1rem', '0.75rem'] : [50, '1.25rem', '0.875rem'];
  }, [size]);

  return (
    <Stack alignItems='center' direction='row' spacing={1.25}>
      <IdentityIcon className='AddressRow-Icon' size={iconSize} value={value} />
      <Stack className='AddressRow-Address' spacing={0.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography fontSize={nameFontSize} fontWeight={700}>
            <AccountName value={value} />
          </Typography>
          {label && <Chip color='secondary' label={label} size={size === 'small' ? 'small' : 'medium'} variant='filled' />}
        </Box>
        <Box color='text.secondary' sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography fontSize={addressFontSize} sx={{ wordBreak: 'break-all' }}>
            {value?.toString()}
          </Typography>
          <CopyButton value={value?.toString()} />
        </Box>
        <Typography color='text.secondary' fontSize={addressFontSize} fontWeight={700}>
          {withBalance && <FormatBalance value={balance} />}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default React.memo(AddressRow);
