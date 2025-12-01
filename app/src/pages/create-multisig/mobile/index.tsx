// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkProvider } from '@mimir-wallet/polkadot-core';

import CreateMultisig from './CreateMultisig';

import { useInputNetwork } from '@/hooks/useInputNetwork';

function PageCreateMultisig() {
  const [network, setNetwork] = useInputNetwork();

  return (
    <NetworkProvider network={network}>
      <CreateMultisig network={network} setNetwork={setNetwork} />
    </NetworkProvider>
  );
}

export default PageCreateMultisig;
