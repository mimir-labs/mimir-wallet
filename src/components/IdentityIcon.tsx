// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IdentityProps } from '@polkadot/react-identicon/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box } from '@mui/material';
import { Polkadot as PolkadotIcon } from '@polkadot/react-identicon/icons/Polkadot';
import { hexToU8a, isHex, isU8a } from '@polkadot/util';
import React, { useCallback, useMemo } from 'react';

import { encodeAddress } from '@mimir-wallet/api';
import { walletConfig } from '@mimir-wallet/config';
import { useAddressMeta } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

interface Props {
  className?: string;
  prefix?: IdentityProps['prefix'];
  size?: number;
  value?: AccountId | AccountIndex | Address | string | Uint8Array | null;
  isMe?: boolean;
  onClick?: (value?: string) => void;
}

function isCodec(
  value?: AccountId | AccountIndex | Address | string | Uint8Array | null
): value is AccountId | AccountIndex | Address {
  return !!(value && (value as AccountId).toHuman);
}

function IdentityIcon({ className, isMe, onClick, prefix, size = 30, value }: Props) {
  const { address, publicKey } = useMemo(() => {
    try {
      const _value = isCodec(value) ? value.toString() : value;
      const address = isU8a(_value) || isHex(_value) ? encodeAddress(_value, prefix) : _value || '';

      return { address, publicKey: '0x' };
    } catch {
      return { address: '', publicKey: '0x' };
    }
  }, [prefix, value]);
  const { meta } = useAddressMeta(value?.toString());

  const { isInjected, isMultisig, source, threshold, who, multipleMultisig } = meta || {};

  const extensionIcon = isInjected ? walletConfig[source || '']?.icon : undefined;

  const _onClick = useCallback(() => {
    onClick?.(value?.toString());
  }, [onClick, value]);

  const isZeroAddress = useMemo(() => addressEq(hexToU8a('0x0', 256), address), [address]);

  if (isMe || isZeroAddress) {
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
        {isMe ? 'Me' : '0'}
      </Box>
    );
  }

  return (
    <Box
      className={`${className} IdentityIcon`}
      component='span'
      onClick={_onClick}
      sx={{
        cursor: onClick ? 'pointer' : undefined,
        position: 'relative',
        width: size,
        height: size + (isMultisig ? 6 + size / 16 : 0),
        bgcolor: 'secondary.main',
        borderRadius: '50%'
      }}
    >
      <PolkadotIcon address={address} publicKey={publicKey} size={size} />
      {extensionIcon ? (
        <Box
          component='img'
          src={extensionIcon}
          sx={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: size / 2.5,
            height: size / 2.5
          }}
        />
      ) : null}
      {((who && who.length > 0) || multipleMultisig) && (
        <Box
          component='span'
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: Math.max(12, size / 2.5),
            borderRadius: `${Math.max(12, size / 2.5) / 2}px`,
            bgcolor: 'primary.main',
            color: 'common.white',
            fontWeight: 700,
            fontSize: size / 3
          }}
        >
          {who && who.length > 0 ? `${threshold}/${who.length}` : 'Multi'}
        </Box>
      )}
    </Box>
  );
}

export default React.memo(IdentityIcon);
