// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IdentityProps } from '@polkadot/react-identicon/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { getAddressMeta } from '@mimir-wallet/utils';
import { Box } from '@mui/material';
import { Polkadot as PolkadotIcon } from '@polkadot/react-identicon/icons/Polkadot';
import keyring from '@polkadot/ui-keyring';
import { isHex, isU8a } from '@polkadot/util';
import React, { useCallback, useMemo } from 'react';

interface Props {
  className?: string;
  prefix?: IdentityProps['prefix'];
  size?: number;
  value?: AccountId | AccountIndex | Address | string | Uint8Array | null;
  isMe?: boolean;
  onClick?: (value?: string) => void;
}

function isCodec(value?: AccountId | AccountIndex | Address | string | Uint8Array | null): value is AccountId | AccountIndex | Address {
  return !!(value && (value as AccountId).toHuman);
}

function IdentityIcon({ className, isMe, onClick, prefix, size = 30, value }: Props) {
  const { address, publicKey } = useMemo(() => {
    try {
      const _value = isCodec(value) ? value.toString() : value;
      const address = isU8a(_value) || isHex(_value) ? keyring.encodeAddress(_value, prefix) : _value || '';

      return { address, publicKey: '0x' };
    } catch {
      return { address: '', publicKey: '0x' };
    }
  }, [prefix, value]);

  const { isMultisig, threshold, who } = useMemo(() => {
    return getAddressMeta(value?.toString() || '');
  }, [value]);

  const _onClick = useCallback(() => {
    onClick?.(value?.toString());
  }, [onClick, value]);

  if (isMe) {
    return (
      <Box
        className={`${className} IdentityIcon`}
        component='span'
        onClick={_onClick}
        sx={{
          cursor: onClick ? 'pointer' : undefined,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          bgcolor: 'primary.main',
          borderRadius: '50%',
          color: 'common.white',
          fontWeight: 800,
          fontSize: Math.min(16, size / 2),
          lineHeight: 1
        }}
      >
        Me
      </Box>
    );
  }

  return (
    <Box
      className={`${className} IdentityIcon`}
      component='span'
      onClick={_onClick}
      sx={{ cursor: onClick ? 'pointer' : undefined, position: 'relative', width: size, height: size + (isMultisig ? 6 + size / 16 : 0), bgcolor: 'secondary.main', borderRadius: '50%' }}
    >
      <PolkadotIcon address={address} publicKey={publicKey} size={size} />
      {isMultisig && (
        <Box
          component='span'
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
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
