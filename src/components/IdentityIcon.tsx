// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IdentityProps } from '@polkadot/react-identicon/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box } from '@mui/material';
import { Polkadot as PolkadotIcon } from '@polkadot/react-identicon/icons/Polkadot';
import { isHex, isU8a } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
import React, { useMemo } from 'react';

import { getAddressMeta } from '@mimirdev/utils';

interface Props {
  className?: string;
  prefix?: IdentityProps['prefix'];
  size?: number;
  value?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function isCodec(value?: AccountId | AccountIndex | Address | string | Uint8Array | null): value is AccountId | AccountIndex | Address {
  return !!(value && (value as AccountId).toHuman);
}

function IdentityIcon({ className, prefix, size = 30, value }: Props) {
  const { address, publicKey } = useMemo(() => {
    try {
      const _value = isCodec(value) ? value.toString() : value;
      const address = isU8a(_value) || isHex(_value) ? encodeAddress(_value, prefix) : _value || '';

      return { address, publicKey: '0x' };
    } catch {
      return { address: '', publicKey: '0x' };
    }
  }, [prefix, value]);

  const { isMultisig, threshold, who } = useMemo(() => {
    return getAddressMeta(value?.toString() || '');
  }, [value]);

  return (
    <Box className={`${className} IdentityIcon`} sx={{ position: 'relative', width: size, height: size, bgcolor: 'secondary.main', borderRadius: '50%' }}>
      <PolkadotIcon address={address} publicKey={publicKey} size={size} />
      {isMultisig && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -(6 + size / 16),
            height: 12 + size / 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            borderRadius: `${6 + size / 16}px`,
            bgcolor: 'primary.main',
            color: 'common.white',
            fontWeight: 700,
            fontSize: '0.75rem',
            transformOrigin: 'center',
            transform: size < 24 ? `scale(${size / 24})` : undefined
          }}
        >
          {threshold}/{who?.length}
        </Box>
      )}
    </Box>
  );
}

export default React.memo(IdentityIcon);
