// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useState } from 'react';

import { NetworkProvider, useChainStatus, useNetwork } from '@mimir-wallet/polkadot-core';
import { Spinner } from '@mimir-wallet/ui';

import AddProxy from './AddProxy';

function PageAddProxy({ pure }: { pure?: boolean }) {
  const { current } = useAccount();
  const [proxied, setProxied] = useState<string | undefined>(current);
  const supportedNetworks = useAddressSupportedNetworks(proxied);
  const [network, setNetwork] = useInputNetwork(
    undefined,
    supportedNetworks?.map((item) => item.key)
  );

  return (
    <NetworkProvider network={network}>
      <AddProxyContent
        pure={pure}
        network={network}
        setNetwork={setNetwork}
        proxied={proxied}
        setProxied={setProxied}
      />
    </NetworkProvider>
  );
}

function AddProxyContent({
  pure,
  network,
  setNetwork,
  proxied,
  setProxied
}: {
  pure?: boolean;
  network: string;
  setNetwork: (network: string) => void;
  proxied: string | undefined;
  setProxied: (proxied: string | undefined) => void;
}) {
  const { chain } = useNetwork();
  const { isApiReady } = useChainStatus(network);

  if (!isApiReady) {
    return (
      <div className='bg-content1 mx-auto my-0 flex w-[500px] max-w-full items-center justify-center rounded-[20px] py-10'>
        <Spinner size='lg' variant='wave' label={`Connecting to the ${chain.name}...`} />
      </div>
    );
  }

  return <AddProxy pure={pure} network={network} setNetwork={setNetwork} proxied={proxied} setProxied={setProxied} />;
}

export default PageAddProxy;
