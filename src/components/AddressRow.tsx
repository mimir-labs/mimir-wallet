// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box, Stack } from '@mui/material';
import React, { useMemo } from 'react';

import AddressComp from './Address';
import AddressName from './AddressName';
import CopyButton from './CopyButton';
import IdentityIcon from './IdentityIcon';

interface Props {
  defaultName?: string;
  value?: AccountId | AccountIndex | Address | string | null;
  size?: 'small' | 'medium' | 'large';
  shorten?: boolean;
  withAddress?: boolean;
  withCopy?: boolean;
  withName?: boolean;
}

function AddressRow({ defaultName, shorten, size = 'medium', value, withAddress = false, withCopy = false, withName = true }: Props) {
  const [iconSize, spacing] = useMemo((): [number, number] => {
    return size === 'small' ? [20, 0.5] : size === 'medium' ? [30, 0.5] : [40, 0.5];
  }, [size]);

  return (
    <Stack alignItems='center' className='AddressRow' direction='row' spacing={spacing}>
      <IdentityIcon className='AddressRow-Icon' size={iconSize} value={value} />
      {withName && (
        <Box component='span' sx={{ fontWeight: withName && withAddress ? 700 : undefined }}>
          <AddressName defaultName={defaultName} value={value} />
        </Box>
      )}
      {withAddress && (
        <Box component='span'>
          <AddressComp shorten={shorten} value={value} />
        </Box>
      )}
      {withCopy && <CopyButton value={value?.toString()} />}
    </Stack>
  );
}

export default React.memo(AddressRow);
