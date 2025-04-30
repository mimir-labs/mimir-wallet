// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddressCell } from '@/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Avatar } from '@mimir-wallet/ui';

function Sender({ address }: { address: string }) {
  const { chain } = useApi();
  const upMd = useMediaQuery('md');

  return (
    <div>
      <p className='font-bold'>Sending From</p>
      <div className='flex bg-secondary rounded-small p-2.5 mt-2'>
        <AddressCell value={address} withCopy shorten={!upMd} />
        <div className='flex items-center gap-1'>
          <Avatar src={chain.icon} alt={chain.name} style={{ width: 20, height: 20, background: 'transparent' }} />
          {chain.name}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Sender);
