// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi } from '@mimir-wallet/polkadot-core';

import { useBestBlock } from './useBestBlock';
import { useRelayBestBlock } from './useRelayBestBlock';

/**
 * Hook to get the appropriate best block for proxy announcement time calculations
 *
 * Some parachains (like assethub-kusama, assethub-paseo, assethub-westend) require using
 * the relay chain block number instead of the parachain block number for calculating
 * when proxy announcements become executable.
 *
 * @returns A tuple containing:
 *   - bestBlock: The block header to use for time calculations
 *   - isFetched: Whether the initial fetch has completed
 *   - isFetching: Whether a fetch is currently in progress
 *
 * @remarks
 * Selection logic:
 * - If chain.useRelayBlockForProxy is true AND relay block is available:
 *   Returns relay chain block
 * - Otherwise:
 *   Returns current parachain/chain block
 *
 * Fallback behavior:
 * - If relay block is required but not yet available, falls back to parachain block
 * - This ensures the UI remains functional even if relay chain API is slow to initialize
 */
export function useProxyBestBlock() {
  const { chain } = useApi();
  const parachainBlock = useBestBlock();
  const relayBlock = useRelayBestBlock();

  // Use relay chain block if:
  // 1. Chain configuration requires it (useRelayBlockForProxy=true)
  // 2. Relay block data is available
  if (chain.useRelayBlockForProxy && relayBlock[0]) {
    return relayBlock;
  }

  // Fallback to parachain block:
  // - For chains that don't need relay block
  // - When relay block is required but not yet available (graceful degradation)
  return parachainBlock;
}
