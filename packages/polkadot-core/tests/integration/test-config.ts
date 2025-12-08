// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

/**
 * Integration test configuration for Paseo testnet
 */
export const TEST_CONFIG = {
  paseo: {
    key: 'paseo',
    name: 'Paseo Relay',
    wsUrl: 'wss://rpc.ibp.network/paseo',
    genesisHash:
      '0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f' as HexString,
    ss58Format: 0,
    nativeDecimals: 10,
    nativeToken: 'PAS',
    supportsDryRun: true,
    supportsProxy: true,
  },
  assetHubPaseo: {
    key: 'assethub-paseo',
    name: 'Asset Hub Paseo',
    wsUrl: 'wss://sys.ibp.network/asset-hub-paseo',
    genesisHash:
      '0xd6eec26135305a8ad257a20d003357284c8aa03d0bdb2b357ab0a22371e11ef2' as HexString,
    ss58Format: 0,
    paraId: 1000,
    relayChain: 'paseo',
    nativeDecimals: 10,
    nativeToken: 'PAS',
    supportsDryRun: true,
    supportsProxy: true,
  },
} as const;

/**
 * Well-known test addresses (Substrate standard dev accounts)
 * These accounts have known balances on testnets
 */
export const TEST_ADDRESSES = {
  // Alice - standard dev account
  alice: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  aliceHex:
    '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d' as HexString,

  // Bob - standard dev account
  bob: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  bobHex:
    '0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48' as HexString,

  // Charlie - standard dev account
  charlie: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
  charlieHex:
    '0x90b5ab205c6974c9ea841be688864633dc9ca8a357843eeacf2314649965fe22' as HexString,

  // Treasury
  treasury: '5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z',
} as const;

/**
 * Test timeouts
 */
export const TIMEOUTS = {
  connection: 30000,
  query: 15000,
  transaction: 60000,
  dryRun: 30000,
} as const;

/**
 * Helper to get primary RPC endpoint for a chain
 */
export function getPrimaryRpcUrl(chain: keyof typeof TEST_CONFIG): string {
  return TEST_CONFIG[chain].wsUrl;
}

/**
 * Check if an address has balance on testnet
 * Note: Dev accounts may not have balance on Paseo
 */
export function isKnownTestAddress(address: string): boolean {
  return Object.values(TEST_ADDRESSES).includes(address as any);
}
