// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import SwapForm from './SwapForm';

import { useAccount } from '@/accounts/useAccount';
import {
  InputNetworkTokenProvider,
  useInputNetworkTokenContext,
} from '@/components/InputNetworkToken';
import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useInputNetwork } from '@/hooks/useInputNetwork';

/**
 * Wrapper component that reads context for form props
 */
function CrossChainSwapContent({ sending }: { sending: string }) {
  const { token, network } = useInputNetworkTokenContext();

  return <SwapForm sending={sending} fromToken={token} fromNetwork={network} />;
}

/**
 * Main Cross-chain Swap DApp entry point
 */
function CrossChainSwap() {
  const { current } = useAccount();
  const supportedNetworks = useAddressSupportedNetworks(current)?.map(
    (item) => item.key,
  );
  const [initialNetwork] = useInputNetwork(undefined, supportedNetworks);

  return (
    <InputNetworkTokenProvider
      address={current}
      defaultNetwork={initialNetwork}
      supportedNetworks={supportedNetworks}
      xcmOnly
    >
      <CrossChainSwapContent sending={current || ''} />
    </InputNetworkTokenProvider>
  );
}

export default CrossChainSwap;
