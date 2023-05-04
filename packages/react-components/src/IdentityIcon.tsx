// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IdentityProps } from '@polkadot/react-identicon/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box } from '@mui/material';
import { Polkadot as PolkadotIcon } from '@polkadot/react-identicon/icons/Polkadot';
import { isHex, isU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
import React, { useMemo } from 'react';

interface Props {
  prefix?: IdentityProps['prefix'];
  size?: number;
  value?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function isCodec(value?: AccountId | AccountIndex | Address | string | Uint8Array | null): value is AccountId | AccountIndex | Address {
  return !!(value && (value as AccountId).toHuman);
}

function IdentityIcon({ prefix, size = 30, value }: Props) {
  const { address, publicKey } = useMemo(() => {
    try {
      const _value = isCodec(value) ? value.toString() : value;
      const address = isU8a(_value) || isHex(_value) ? encodeAddress(_value, prefix) : _value || '';

      return { address, publicKey: '0x' };
    } catch {
      return { address: '', publicKey: '0x' };
    }
  }, [prefix, value]);

  return (
    <Box sx={{ width: size, height: size, bgcolor: 'secondary.main', borderRadius: '50%' }}>
      <PolkadotIcon address={address} publicKey={publicKey} size={size} />
    </Box>
  );
}

export default React.memo(IdentityIcon);
