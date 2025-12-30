// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Utils exports
export {
  NETWORK_RPC_PREFIX,
  CURRENT_NETWORK_KEY,
  DEFAULE_SS58_CHAIN_KEY,
  ENABLED_NETWORKS_KEY,
  NETWORK_MODE_KEY,
  DEFAULT_NETWORKS,
  decodeAddress,
  encodeAddress,
} from './utils/index.js';
export * from './utils/utils.js';
export * from './utils/registry.js';

// Balances exports
export * from './balances/index.js';

// Call exports
export * from './call/index.js';

// Simulation exports (lazy loaded - import directly from './simulate/index.js' for simulate function)
// Note: simulate function should be dynamically imported to avoid loading @acala-network/chopsticks-core on page load
export * from './dry-run/index.js';

// paraspell exports
export * from './paraspell/index.js';

// Transaction exports
export * from './tx/index.js';

// XCM exports
export * from './xcm/index.js';

// Chain config exports
export { chainLinks } from './chains/index.js';
export {
  allEndpoints,
  remoteProxyRelations,
  getChainIcon,
  resolveChain,
  getRelayChainKey,
  getRelaySystemChains,
  getAssetHub,
  getBridgeHub,
} from './chains/index.js';
export type { ChainIdentifier, RelaySystemChains } from './chains/index.js';

// API management exports
export {
  ApiManager,
  useAllChainStatuses,
  useAllChainsConnected,
  useApiStore,
  useChain,
  useChains,
  useChainStatus,
  useSs58Format,
  initializeApiStore,
} from './api/index.js';
export type { ApiState, ChainsControl } from './api/index.js';

// Network context exports
export {
  NetworkProvider,
  useNetwork,
  useNetworkOptional,
} from './context/index.js';

// Type exports
export type {
  Endpoint,
  Network,
  ChainStatus,
  ApiConnection,
  Ss58FormatControl,
  ApiManagerListener,
} from './types/index.js';
