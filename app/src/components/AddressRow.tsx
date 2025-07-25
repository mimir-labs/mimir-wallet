// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import React, { forwardRef, useMemo } from 'react';

import { encodeAddress, useApi } from '@mimir-wallet/polkadot-core';

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
      ...props
    }: Props,
    ref
  ) => {
    const { chainSS58 } = useApi();
    const address = useMemo(() => encodeAddress(value, chainSS58), [value, chainSS58]);

    return (
      <div className={`AddressRow flex items-center gap-[5px] ${className || ''}`} ref={ref} {...props}>
        <IdentityIcon className='AddressRow-Icon' size={iconSize} value={address} />
        <div className='AddressRow-Content flex items-center gap-[5px]'>
          {withName && (
            <span data-bold={withName && withAddress} className='AddressRow-Name data-[bold="true"]:font-bold'>
              <AddressName defaultName={defaultName} value={address} />
            </span>
          )}
          <span className='AddressRow-Address flex items-center gap-[5px] text-[0.875em]'>
            {withAddress && <AddressComp shorten={shorten} value={address} />}
            {withCopy && <CopyAddress address={address} className='opacity-50' />}
          </span>
        </div>
      </div>
    );
  }
);

AddressRow.displayName = 'AddressRow';

export default React.memo(AddressRow);
