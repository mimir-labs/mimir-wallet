// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box, Chip, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { getAddressMeta } from '@mimirdev/utils';

import AddressComp from './Address';
import AddressName from './AddressName';
import CopyButton from './CopyButton';
import IdentityIcon from './IdentityIcon';

interface Props {
  value?: AccountId | AccountIndex | Address | string | null;
  size?: 'small' | 'medium' | 'large';
  shorten?: boolean;
  showType?: boolean;
  withCopy?: boolean;
  width?: number | string;
}

function AddressCell({ shorten = true, showType = false, size = 'medium', value, width, withCopy = false }: Props) {
  const [iconSize, nameFontSize, addressFontSize, spacing, spacingCol] = useMemo((): [number, string, string, number, number] => {
    return size === 'small' ? [30, '0.875rem', '0.75rem', 0.5, 0.2] : size === 'medium' ? [40, '1rem', '0.75rem', 0.5, 0.5] : [50, '1.25rem', '0.875rem', 1, 0.5];
  }, [size]);

  const address = value?.toString();

  const { isFlexible, isMultisig } = useMemo(() => getAddressMeta(address || ''), [address]);

  return (
    <Stack alignItems='center' className='AddressCell' direction='row' flex='1' spacing={spacing} width={width}>
      <IdentityIcon className='AddressCell-Icon' size={iconSize} value={value} />
      <Stack className='AddressCell-Address' spacing={spacingCol}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography component='span' fontSize={nameFontSize} fontWeight={size === 'large' ? 800 : 700} sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <AddressName value={value} />
          </Typography>
          {showType && <Chip color='secondary' label={isMultisig ? (isFlexible ? 'Flexible' : 'Static') : 'Solo'} size={size === 'large' ? 'medium' : 'small'} />}
        </Box>
        <Typography color='text.secondary' component='span' fontSize={addressFontSize} sx={{ display: 'flex', alignItems: 'center' }}>
          <AddressComp shorten={shorten} value={address} />
          {withCopy && <CopyButton value={address} />}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default React.memo(AddressCell);
