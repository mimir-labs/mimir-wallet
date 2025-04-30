// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useNetworks } from '@mimir-wallet/polkadot-core';

import OmiChainSelect from './OmniChainSelect';
import SoloChainSelect from './SoloChainSelect';

function ChainSelect() {
  const { mode } = useNetworks();

  return mode === 'omni' ? <OmiChainSelect /> : <SoloChainSelect />;
}

export default ChainSelect;
