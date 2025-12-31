// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Endpoint } from '../types/types.js';
import type { HexString } from '@polkadot/util/types';

import kusamaChains from './kusama.json' with { type: 'json' };
import paseoChains from './paseo.json' with { type: 'json' };
import polkadotChains from './polkadot.json' with { type: 'json' };
import solochainChains from './solochain.json' with { type: 'json' };
import westendChains from './westend.json' with { type: 'json' };

export const allEndpoints: Endpoint[] = import.meta.env.VITE_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_ENDPOINTS)
  : [
      ...(polkadotChains as unknown as Endpoint[]),
      ...(kusamaChains as unknown as Endpoint[]),
      ...(paseoChains as unknown as Endpoint[]),
      ...(westendChains as unknown as Endpoint[]),
      ...(solochainChains as unknown as Endpoint[]),
    ];

export const remoteProxyRelations: Record<HexString, HexString> =
  allEndpoints.reduce(
    (acc, item) => {
      if (item.remoteProxyTo) {
        acc[item.genesisHash] = item.remoteProxyTo as HexString;
      }

      return acc;
    },
    {} as Record<HexString, HexString>,
  );

const chainMap: Map<string, Endpoint | undefined> = new Map();

export function getChainIcon(key: string) {
  if (chainMap.has(key)) {
    return chainMap.get(key);
  }

  const endpoint = allEndpoints.find(
    (item) => item.key === key || item.genesisHash === key,
  );

  chainMap.set(key, endpoint);

  return endpoint;
}

/**
 * Chain identifier - can be a key, genesisHash, or Endpoint object
 */
export type ChainIdentifier = string | Endpoint;

/**
 * Resolve chain identifier (network key, genesis hash, or Endpoint) to Endpoint
 *
 * @param chain - Network key (e.g., 'polkadot'), genesis hash, or Endpoint object
 * @returns Endpoint configuration or undefined if not found
 */
export function resolveChain(chain: ChainIdentifier): Endpoint | undefined {
  if (typeof chain !== 'string') {
    return chain;
  }

  return allEndpoints.find(
    (item) => item.key === chain || item.genesisHash === chain,
  );
}

/**
 * System chains info for a relay chain
 */
export interface RelaySystemChains {
  assetHub?: Endpoint;
  bridgeHub?: Endpoint;
}

/**
 * Get the relay chain key for a given chain
 * If the chain is a relay chain itself, returns its own key
 *
 * @param chain - Chain key, genesisHash, or Endpoint object
 * @returns The relay chain key, or undefined if chain not found
 */
export function getRelayChainKey(chain: ChainIdentifier): string | undefined {
  const endpoint = resolveChain(chain);

  if (!endpoint) return undefined;

  return endpoint.relayChain || endpoint.key;
}

/**
 * Get AssetHub and BridgeHub for the relay chain that sourceChain belongs to
 *
 * @param chain - Chain key, genesisHash, or Endpoint object
 * @returns Object containing assetHub and bridgeHub endpoints (if available)
 *
 * @example
 * ```ts
 * // Using chain key
 * const { assetHub, bridgeHub } = getRelaySystemChains('acala');
 *
 * // Using genesisHash
 * const { assetHub } = getRelaySystemChains('0x91b171...');
 *
 * // Using Endpoint object
 * const chain = allEndpoints.find(e => e.key === 'acala');
 * const { assetHub, bridgeHub } = getRelaySystemChains(chain);
 * ```
 */
export function getRelaySystemChains(
  chain: ChainIdentifier,
): RelaySystemChains {
  const relayChainKey = getRelayChainKey(chain);

  if (!relayChainKey) {
    return {};
  }

  const assetHubKey = `assethub-${relayChainKey}`;
  const bridgeHubKey = `bridgehub-${relayChainKey}`;

  const assetHub = allEndpoints.find((e) => e.key === assetHubKey);
  const bridgeHub = allEndpoints.find((e) => e.key === bridgeHubKey);

  return { assetHub, bridgeHub };
}

/**
 * Get AssetHub endpoint for the relay chain that the given chain belongs to
 *
 * @param chain - Chain key, genesisHash, or Endpoint object
 */
export function getAssetHub(chain: ChainIdentifier): Endpoint | undefined {
  return getRelaySystemChains(chain).assetHub;
}

/**
 * Get BridgeHub endpoint for the relay chain that the given chain belongs to
 *
 * @param chain - Chain key, genesisHash, or Endpoint object
 */
export function getBridgeHub(chain: ChainIdentifier): Endpoint | undefined {
  return getRelaySystemChains(chain).bridgeHub;
}
