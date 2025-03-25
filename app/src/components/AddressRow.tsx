// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import React, { useMemo } from 'react';

import { encodeAddress } from '@mimir-wallet/polkadot-core';

import AddressComp from './Address';
import AddressName from './AddressName';
import CopyButton from './CopyButton';
import IdentityIcon from './IdentityIcon';

interface Props {
  defaultName?: string;
  value?: AccountId | AccountIndex | Address | Uint8Array | string | null;
  shorten?: boolean;
  iconSize?: number;
  withAddress?: boolean;
  withCopy?: boolean;
  withName?: boolean;
}

function AddressRow({
  defaultName,
  shorten,
  value,
  iconSize,
  withAddress = false,
  withCopy = false,
  withName = true
}: Props) {
  const address = useMemo(() => encodeAddress(value), [value]);

  return (
    <div className='AddressRow inline-flex items-center gap-[5px]'>
      <IdentityIcon className='AddressRow-Icon' size={iconSize} value={address} />
      {withName && (
        <span style={{ fontWeight: withName && withAddress ? 700 : undefined }}>
          <AddressName defaultName={defaultName} value={address} />
        </span>
      )}
      {withAddress && (
        <span>
          <AddressComp shorten={shorten} value={address} />
        </span>
      )}
      {withCopy && <CopyButton value={address} className='opacity-50' />}
    </div>
  );
}

export default React.memo(AddressRow);
