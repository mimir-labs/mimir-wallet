// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { Circle } from '@polkadot/ui-shared/icons/types';

import { Box } from '@mui/material';
import { polkadotIcon } from '@polkadot/ui-shared';
import { hexToU8a, isHex, isU8a } from '@polkadot/util';
import React, { useMemo } from 'react';

import { useAddressMeta } from '@mimir-wallet/accounts/useAddressMeta';
import { encodeAddress } from '@mimir-wallet/api';
import { walletConfig } from '@mimir-wallet/config';
import { useCopyClipboard } from '@mimir-wallet/hooks/useCopyClipboard';
import { addressEq } from '@mimir-wallet/utils';

import { toastSuccess } from './utils';

interface Props {
  className?: string;
  prefix?: number;
  size?: number;
  value?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function isCodec(
  value?: AccountId | AccountIndex | Address | string | Uint8Array | null
): value is AccountId | AccountIndex | Address {
  return !!(value && (value as AccountId).toHuman);
}

function renderCircle({ cx, cy, fill, r }: Circle, index: number) {
  return <circle key={index} cx={cx} cy={cy} fill={fill} r={r} />;
}

function IdentityIcon({ className, prefix, size = 30, value }: Props) {
  const { address } = useMemo(() => {
    try {
      const _value = isCodec(value) ? value.toString() : value;
      const address = isU8a(_value) || isHex(_value) ? encodeAddress(_value, prefix) : _value || '';

      return { address };
    } catch {
      return { address: '' };
    }
  }, [prefix, value]);
  const { meta } = useAddressMeta(value?.toString());
  const [, copy] = useCopyClipboard();

  const { isInjected, isMultisig, source, threshold, who, multipleMultisig } = meta || {};

  const extensionIcon = isInjected ? walletConfig[source || '']?.icon : undefined;

  const isZeroAddress = useMemo(() => addressEq(hexToU8a('0x0', 256), address), [address]);

  const circles = useMemo(() => polkadotIcon(address, { isAlternative: false }), [address]);

  if (isZeroAddress) {
    return (
      <Box
        className={`${className} IdentityIcon`}
        component='span'
        onClick={(e) => {
          e.stopPropagation();
          copy(address);
          toastSuccess('Copied to clipboard');
        }}
        sx={{
          cursor: 'copy',
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
        0
      </Box>
    );
  }

  return (
    <Box
      className={`${className} IdentityIcon`}
      component='span'
      onClick={(e) => {
        e.stopPropagation();
        copy(address);
        toastSuccess('Copied to clipboard');
      }}
      sx={{
        cursor: 'copy',
        position: 'relative',
        width: size,
        height: size + (isMultisig ? 6 + size / 16 : 0),
        bgcolor: 'secondary.main',
        borderRadius: '50%'
      }}
    >
      {isZeroAddress ? (
        <Box
          className={`${className} IdentityIcon`}
          component='span'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size,
            height: size,
            bgcolor: 'primary.main',
            borderRadius: '50%',
            color: 'common.white',
            fontWeight: 800,
            fontSize: size / 2,
            lineHeight: 1
          }}
        >
          0
        </Box>
      ) : (
        <svg viewBox='0 0 64 64' width={size} height={size}>
          {circles.map(renderCircle)}
        </svg>
      )}
      {extensionIcon ? (
        <Box
          component='img'
          src={extensionIcon}
          sx={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: size / 2.2,
            height: size / 2.2
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
