// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';

import { afterAll, beforeAll } from 'vitest';

import { ApiManager } from '../../src/api/ApiManager.js';

import { TEST_CONFIG, TIMEOUTS } from './test-config.js';

/**
 * Global test state
 */
export let paseoApi: ApiPromise;
export let assetHubApi: ApiPromise;
export let apiManager: ApiManager;

/**
 * Helper to create Endpoint config for tests
 */
function createTestEndpoint(
  config: typeof TEST_CONFIG.paseo | typeof TEST_CONFIG.assetHubPaseo,
) {
  return {
    key: config.key,
    name: config.name,
    icon: '',
    tokenIcon: '',
    wsUrl: { test: config.wsUrl },
    genesisHash: config.genesisHash,
    ss58Format: config.ss58Format,
    nativeDecimals: config.nativeDecimals,
    nativeToken: config.nativeToken,
    supportsDryRun: config.supportsDryRun,
    supportsProxy: config.supportsProxy,
    isTestnet: true,
    ...('paraId' in config
      ? { paraId: config.paraId, relayChain: config.relayChain }
      : { isRelayChain: true }),
  };
}

/**
 * Global setup - initialize API connections
 */
beforeAll(
  async () => {
    console.log('[Setup] Initializing Paseo testnet connections...');

    apiManager = ApiManager.getInstance();

    // Initialize Paseo relay chain
    const paseoEndpoint = createTestEndpoint(TEST_CONFIG.paseo);

    try {
      await Promise.race([
        apiManager.initialize(paseoEndpoint as any),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Paseo connection timeout')),
            TIMEOUTS.connection,
          ),
        ),
      ]);
      paseoApi = await apiManager.getApi(TEST_CONFIG.paseo.key);
      console.log(
        `[Setup] Connected to Paseo relay chain: ${paseoApi.runtimeVersion.specName.toString()}`,
      );
    } catch (error) {
      console.error('[Setup] Failed to connect to Paseo:', error);
      throw error;
    }

    // Initialize Asset Hub Paseo
    const assetHubEndpoint = createTestEndpoint(TEST_CONFIG.assetHubPaseo);

    try {
      await Promise.race([
        apiManager.initialize(assetHubEndpoint as any),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Asset Hub connection timeout')),
            TIMEOUTS.connection,
          ),
        ),
      ]);
      assetHubApi = await apiManager.getApi(TEST_CONFIG.assetHubPaseo.key);
      console.log(
        `[Setup] Connected to Asset Hub Paseo: ${assetHubApi.runtimeVersion.specName.toString()}`,
      );
    } catch (error) {
      console.error('[Setup] Failed to connect to Asset Hub:', error);
      throw error;
    }

    console.log('[Setup] All connections established');
  },
  TIMEOUTS.connection * 2 + 10000,
);

/**
 * Global teardown - disconnect all APIs
 */
afterAll(async () => {
  console.log('[Teardown] Disconnecting APIs...');

  if (apiManager) {
    apiManager.destroy(TEST_CONFIG.paseo.key);
    apiManager.destroy(TEST_CONFIG.assetHubPaseo.key);
  }

  console.log('[Teardown] Cleanup complete');
}, 10000);

/**
 * Helper to wait for API to be ready
 */
export async function waitForApiReady(
  api: ApiPromise,
  timeout = TIMEOUTS.connection,
): Promise<void> {
  const startTime = Date.now();

  while (!api.isConnected) {
    if (Date.now() - startTime > timeout) {
      throw new Error('API connection timeout');
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * Helper to skip test if API is not connected
 */
export function skipIfNotConnected(
  api: ApiPromise | undefined,
  testName: string,
): void {
  if (!api || !api.isConnected) {
    console.warn(`[Skip] ${testName}: API not connected`);
    throw new Error('API not connected - skipping test');
  }
}
