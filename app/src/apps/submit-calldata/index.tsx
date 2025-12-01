// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkProvider } from '@mimir-wallet/polkadot-core';
import { useMemo, useState } from 'react';

import Extrinsic from './Extrinsic';

import { useAccount } from '@/accounts/useAccount';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';

function SubmitCalldata() {
  const { current } = useAccount();
  const [sending, setSending] = useState<string>(current || '');
  const supportedNetworks = useAddressSupportedNetworks(sending);
  const supportedNetworksKeys = useMemo(() => supportedNetworks?.map((item) => item.key), [supportedNetworks]);
  const [network, setNetwork] = useInputNetwork(undefined, supportedNetworksKeys);

  return (
    <NetworkProvider network={network}>
      <Extrinsic sending={sending} setSending={setSending} network={network} setNetwork={setNetwork} />
    </NetworkProvider>
  );
}

export default SubmitCalldata;
