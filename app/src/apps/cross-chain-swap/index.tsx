// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useChains } from '@mimir-wallet/polkadot-core';

import SwapForm from './SwapForm';
import { SwapFormProvider } from './SwapFormContext';

import { useAccount } from '@/accounts/useAccount';
import { useInputNetwork } from '@/hooks/useInputNetwork';

/**
 * Check if a network is Polkadot or a Polkadot parachain
 */
function isPolkadotNetwork(network: { key: string; relayChain?: string }) {
  return network.relayChain === 'polkadot' || network.key === 'polkadot';
}

/**
 * Main Cross-chain Swap DApp entry point
 */
function CrossChainSwap() {
  const { current } = useAccount();
  const { chains } = useChains();

  // Filter to only Polkadot networks (relay chain + parachains)
  const supportedNetworks = chains
    .filter(isPolkadotNetwork)
    .map((item) => item.key);

  const [initialNetwork] = useInputNetwork(undefined, supportedNetworks);

  if (!current) {
    return null;
  }

  return (
    <SwapFormProvider
      address={current}
      supportedNetworks={supportedNetworks}
      defaultNetwork={initialNetwork}
    >
      <SwapForm />
    </SwapFormProvider>
  );
}

export default CrossChainSwap;
