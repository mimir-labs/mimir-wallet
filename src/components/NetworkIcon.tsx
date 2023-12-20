// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import Kusuma from '@mimir-wallet/assets/images/Kusuma.png';
import Polkadot from '@mimir-wallet/assets/images/Polkadot.png';
import React from 'react';

import IdentityIcon from './IdentityIcon';

export const networkIcon: Record<string, string> = {
  Polkadot,
  Kusuma
};

function NetworkIcon({ genesisHash, size = 14 }: { genesisHash: HexString; size?: number }) {
  const Icon = networkIcon[genesisHash];

  if (Icon) {
    return <img alt={genesisHash} height={size} src={Icon} width={size} />;
  } else {
    return <IdentityIcon size={size} value={null} />;
  }
}

export default React.memo(NetworkIcon);
