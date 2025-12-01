// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains } from '@mimir-wallet/polkadot-core';

import OmiChainSelect from './OmniChainSelect';
import SoloChainSelect from './SoloChainSelect';

function ChainSelect(): React.ReactElement {
  const { mode } = useChains();

  return mode === 'omni' ? <OmiChainSelect /> : <SoloChainSelect />;
}

export default ChainSelect;
