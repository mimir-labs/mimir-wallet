// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useMemo, useState } from 'react';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';

import Extrinsic from './Extrinsic';

function PageExtrinsic() {
  const { current } = useAccount();
  const [sending, setSending] = useState<string>(current || '');
  const supportedNetworks = useAddressSupportedNetworks(sending);
  const supportedNetworksKeys = useMemo(() => supportedNetworks?.map((item) => item.key), [supportedNetworks]);
  const [network, setNetwork] = useInputNetwork(undefined, supportedNetworksKeys);

  return (
    <SubApiRoot network={network} supportedNetworks={supportedNetworksKeys}>
      <Extrinsic sending={sending} setSending={setSending} network={network} setNetwork={setNetwork} />
    </SubApiRoot>
  );
}

export default PageExtrinsic;
