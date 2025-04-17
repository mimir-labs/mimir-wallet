// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export { NETWORK_RPC_PREFIX, CURRENT_NETWORK_KEY, decodeAddress, encodeAddress } from './defaults.js';
export { initializeApi } from './initialize.js';

export * from './callFilter.js';
export * from './call.js';

export * from './simulate/index.js';
export * from './tx-events.js';
export * from './tx-reserve.js';
export * from './tx.js';
export { chainLinks } from './chain-links.js';

export { useApi } from './useApi.js';
export { useIdentityApi } from './useIdentityApi.js';
export { useNetworks } from './useNetworks.js';

export {
  polkadotEndpoints,
  kusamaEndpoints,
  paseoEndpoints,
  westendEndpoints,
  solochainEndpoints,
  allEndpoints
} from './config.js';

export { addressEq, addressToHex } from './utils.js';

export { default as ApiRoot } from './ApiRoot.js';
export { default as SubApiRoot } from './SubApiRoot.js';
export type { Endpoint, ValidApiState, Network } from './types.js';
