// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type {
  AccountId,
  AccountIndex,
  Address,
} from '@polkadot/types/interfaces';

import { encodeAddress, useSs58Format } from '@mimir-wallet/polkadot-core';
import React, { forwardRef, useMemo } from 'react';

import AddressComp from './Address';
import AddressName from './AddressName';
import CopyAddress from './CopyAddress';
import IdentityIcon from './IdentityIcon';

interface Props {
  className?: string;
  defaultName?: string;
  value?: AccountId | AccountIndex | Address | Uint8Array | string | null;
  shorten?: boolean;
  iconSize?: number;
  withAddress?: boolean;
  withCopy?: boolean;
  withName?: boolean;
  showMultisigBadge?: boolean;
}

const AddressRow = forwardRef<HTMLDivElement, Props>(
  (
    {
      defaultName,
      className,
      shorten,
      value,
      iconSize,
      withAddress = false,
      withCopy = false,
      withName = true,
      showMultisigBadge = true,
      ...props
    }: Props,
    ref,
  ) => {
    const { ss58: chainSS58 } = useSs58Format();
    const address = useMemo(
      () => encodeAddress(value, chainSS58),
      [value, chainSS58],
    );

    return (
      <div
        className={`AddressRow flex flex-1 min-w-0 items-center gap-[5px] ${className || ''}`}
        ref={ref}
        style={{ maxHeight: iconSize }}
        {...props}
      >
        <IdentityIcon
          className="AddressRow-Icon"
          size={iconSize}
          value={address}
          showMultisigBadge={showMultisigBadge}
        />
        <div className="AddressRow-Content flex flex-1 min-w-0 items-center gap-1 overflow-hidden">
          {withName && (
            <span
              data-bold={withName && withAddress}
              className='AddressRow-Name min-w-0 overflow-hidden text-left font-bold text-ellipsis whitespace-nowrap data-[bold="true"]:font-bold'
            >
              <AddressName defaultName={defaultName} value={address} />
            </span>
          )}
          <span className="AddressRow-Address flex-1 flex whitespace-nowrap items-center gap-[5px] text-[0.875em]">
            {withAddress && <AddressComp shorten={shorten} value={address} />}
            {withCopy && (
              <CopyAddress address={address} className="opacity-50" />
            )}
          </span>
        </div>
      </div>
    );
  },
);

AddressRow.displayName = 'AddressRow';

export default React.memo(AddressRow);
