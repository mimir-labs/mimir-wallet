// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { Circle } from '@polkadot/ui-shared/icons/types';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { walletConfig } from '@/config';
import { useCopyAddressToClipboard } from '@/hooks/useCopyAddress';
import { polkadotIcon } from '@polkadot/ui-shared';
import { hexToU8a } from '@polkadot/util';
import React, { useMemo } from 'react';

import { addressEq, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { usePress } from '@mimir-wallet/ui';

interface Props {
  className?: string;
  prefix?: number;
  size?: number;
  value?: AccountId | AccountIndex | Address | string | Uint8Array | null;
  withBorder?: boolean;
}

function renderCircle({ cx, cy, fill, r }: Circle, index: number) {
  return <circle key={index} cx={cx} cy={cy} fill={fill} r={r} />;
}

function IdentityIcon({ className, prefix, size = 30, value, withBorder = false }: Props) {
  const { chainSS58 } = useApi();
  const address = encodeAddress(value, prefix ?? chainSS58);
  const { meta } = useAddressMeta(value?.toString());
  const copyAddress = useCopyAddressToClipboard(address);
  const { pressProps } = usePress({
    onPress: () => {
      copyAddress();
    }
  });

  const { isInjected, isMultisig, isProxied, source, threshold, who, multipleMultisig } = meta || {};

  const extensionIcon = isInjected ? walletConfig[source || '']?.icon : undefined;

  const isZeroAddress = useMemo(() => addressEq(hexToU8a('0x0', 256), address), [address]);

  const circles = useMemo(() => polkadotIcon(address, { isAlternative: false }), [address]);

  let element: React.ReactNode;

  if (isZeroAddress) {
    element = (
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
  } else {
    element = (
      <span
        className={`bg-secondary ${className || ''} IdentityIcon`}
        {...pressProps}
        style={{
          cursor: 'copy',
          position: 'relative',
          width: size,
          height: size + ((who && who.length > 0) || multipleMultisig ? 6 + size / 16 : 0),
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
            className='text-white'
            style={{
              zIndex: 2,
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
              fontSize: size / 3,
              background: withBorder
                ? isProxied
                  ? '#B700FF'
                  : 'hsl(var(--heroui-primary))'
                : 'hsl(var(--heroui-primary))'
            }}
          >
            {who && who.length > 0 ? `${threshold}/${who.length}` : 'Multi'}
          </span>
        )}
        {withBorder && !isInjected && (isProxied || isMultisig || multipleMultisig) ? (
          <div
            style={{
              zIndex: 1,
              borderColor: isProxied ? '#B700FF' : 'hsl(var(--heroui-primary))',
              position: 'absolute',
              top: -3,
              right: -3,
              width: size + 6,
              height: size + 6
            }}
            className='pointer-events-none rounded-full border-1'
          >
            {element}
          </div>
        ) : null}
      </span>
    );
  }

  return element;
}

export default React.memo(IdentityIcon);
