// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { useState } from 'react';

import AddProxy from './AddProxy';

import { useAccount } from '@/accounts/useAccount';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';

function PageAddProxy({ pure }: { pure?: boolean }) {
  const { current } = useAccount();
  const [proxied, setProxied] = useState<string | undefined>(current);
  const supportedNetworks = useAddressSupportedNetworks(proxied);
  const [network, setNetwork] = useInputNetwork(
    undefined,
    supportedNetworks?.map((item) => item.key),
  );

  return (
    <NetworkProvider network={network}>
      <AddProxy
        pure={pure}
        network={network}
        supportedNetworks={supportedNetworks?.map((item) => item.key)}
        setNetwork={setNetwork}
        proxied={proxied}
        setProxied={setProxied}
      />
    </NetworkProvider>
  );
}

export default PageAddProxy;
