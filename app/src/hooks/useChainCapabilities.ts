// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';

import { useChain } from '@mimir-wallet/polkadot-core';

export interface ChainCapabilities {
  supportsDryRun: boolean;
  supportsProxy: boolean;
}

/**
 * Hook to get chain capabilities from config
 *
 * This hook checks if the chain supports dry-run API and proxy pallet
 * based on the chain configuration.
 *
 * @param network - The network key to check capabilities for
 * @returns Object containing chain capabilities
 *
 * @example
 * ```tsx
 * const { supportsDryRun, supportsProxy } = useChainCapabilities('polkadot');
 *
 * if (supportsDryRun) {
 *   return <DryRun />;
 * } else {
 *   return <Chopsticks />;
 * }
 * ```
 */
export function useChainCapabilities(network: string): ChainCapabilities {
  const chain = useChain(network);

  // Find chain config and get capabilities
  return useMemo(() => {
    return {
      supportsDryRun: chain?.supportsDryRun ?? false,
      supportsProxy: chain?.supportsProxy ?? true
    };
  }, [chain]);
}

/**
 * Hook to check if chain supports dry-run API
 *
 * @param network - The network key to check
 */
export function useSupportsDryRun(network: string): { supportsDryRun: boolean } {
  const { supportsDryRun } = useChainCapabilities(network);

  return { supportsDryRun };
}

/**
 * Hook to check if chain supports proxy pallet
 *
 * @param network - The network key to check
 */
export function useSupportsProxy(network: string): { supportsProxy: boolean } {
  const { supportsProxy } = useChainCapabilities(network);

  return { supportsProxy };
}
