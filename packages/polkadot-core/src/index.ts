// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export { NETWORK_RPC_PREFIX, CURRENT_NETWORK_KEY, decodeAddress, encodeAddress } from './defaults.js';

export * from './balances/index.js';

export * from './callFilter.js';
export * from './call.js';

export * from './simulate/index.js';
export * from './dry-run/index.js';
export * from './tx-events.js';
export * from './tx-reserve.js';
export * from './tx.js';
export * from './dispatch-error.js';
export * from './dry-run/index.js';
export * from './xcm/index.js';

export { chainLinks } from './chain-links.js';

// New API management exports
export {
  ApiManager,
  useAllChainStatuses,
  useChain,
  useChains,
  useChainStatus,
  useSs58Format,
  getNetworkMode
} from './api/index.js';
export type { ChainsControl } from './api/index.js';

// Network context exports
export { NetworkProvider, useNetwork, useNetworkOptional } from './NetworkContext.js';

export { allEndpoints, remoteProxyRelations, getChainIcon } from './config.js';

export * from './utils.js';
export * from './registry.js';

export type {
  Endpoint,
  ValidApiState,
  Network,
  ChainStatus,
  ApiConnection,
  Ss58FormatControl,
  ApiManagerListener
} from './types.js';
