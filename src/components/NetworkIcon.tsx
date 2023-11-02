// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import React from 'react';

import Kusuma from '@mimirdev/assets/images/Kusuma.png';
import Polkadot from '@mimirdev/assets/images/Polkadot.png';

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
