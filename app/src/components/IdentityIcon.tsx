// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { Circle } from '@polkadot/ui-shared/icons/types';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { walletConfig } from '@/config';
import { useCopyAddress } from '@/hooks/useCopyAddress';
import { useCopyClipboard } from '@/hooks/useCopyClipboard';
import { polkadotIcon } from '@polkadot/ui-shared';
import { hexToU8a } from '@polkadot/util';
import React, { useMemo } from 'react';

import { addressEq, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { usePress } from '@mimir-wallet/ui';

import { toastSuccess } from './utils';

interface Props {
  className?: string;
  prefix?: number;
  size?: number;
  value?: AccountId | AccountIndex | Address | string | Uint8Array | null;
}

function renderCircle({ cx, cy, fill, r }: Circle, index: number) {
  return <circle key={index} cx={cx} cy={cy} fill={fill} r={r} />;
}

function IdentityIcon({ className, prefix, size = 30, value }: Props) {
  const { chainSS58 } = useApi();
  const address = encodeAddress(value, prefix ?? chainSS58);
  const { meta } = useAddressMeta(value?.toString());
  const { open: openCopy } = useCopyAddress();
  const [, copy] = useCopyClipboard();
  const { pressProps } = usePress({
    onPress: () => {
      openCopy(address);
      copy(address);
      toastSuccess('Copied to clipboard');
    }
  });

  const { isInjected, isMultisig, source, threshold, who, multipleMultisig } = meta || {};

  const extensionIcon = isInjected ? walletConfig[source || '']?.icon : undefined;

  const isZeroAddress = useMemo(() => addressEq(hexToU8a('0x0', 256), address), [address]);

  const circles = useMemo(() => polkadotIcon(address, { isAlternative: false }), [address]);

  if (isZeroAddress) {
    return (
      <span
        className={`bg-primary text-white ${className || ''} IdentityIcon`}
        {...pressProps}
        style={{
          cursor: 'copy',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: '50%',
          fontWeight: 800,
          fontSize: Math.min(16, size / 2),
          lineHeight: 1
        }}
      >
        0
      </span>
    );
  }

  return (
    <span
      className={`bg-secondary ${className || ''} IdentityIcon`}
      {...pressProps}
      style={{
        cursor: 'copy',
        position: 'relative',
        width: size,
        height: size + (isMultisig ? 6 + size / 16 : 0),
        borderRadius: '50%'
      }}
    >
      <svg viewBox='0 0 64 64' width={size} height={size}>
        {circles.map(renderCircle)}
      </svg>
      {extensionIcon ? (
        <img
          src={extensionIcon}
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: size / 2.2,
            height: size / 2.2
          }}
        />
      ) : null}
      {((who && who.length > 0) || multipleMultisig) && (
        <span
          className='bg-primary text-white'
          style={{
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
            fontWeight: 700,
            fontSize: size / 3
          }}
        >
          {who && who.length > 0 ? `${threshold}/${who.length}` : 'Multi'}
        </span>
      )}
    </span>
  );
}

export default React.memo(IdentityIcon);
