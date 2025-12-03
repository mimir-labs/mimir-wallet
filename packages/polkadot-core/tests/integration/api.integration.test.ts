// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { ApiManager } from '../../src/api/ApiManager.js';

import { apiManager, assetHubApi, paseoApi, skipIfNotConnected } from './setup.js';
import { TEST_ADDRESSES, TEST_CONFIG, TIMEOUTS } from './test-config.js';

describe('ApiManager Integration Tests', () => {
  describe('Connection Management', () => {
    it('should connect to Paseo relay chain', () => {
      skipIfNotConnected(paseoApi, 'connect to Paseo');

      expect(paseoApi.isConnected).toBe(true);
      expect(paseoApi.genesisHash.toHex()).toBe(TEST_CONFIG.paseo.genesisHash);
    });

    it('should connect to Asset Hub Paseo', () => {
      skipIfNotConnected(assetHubApi, 'connect to Asset Hub');

      expect(assetHubApi.isConnected).toBe(true);
      expect(assetHubApi.genesisHash.toHex()).toBe(TEST_CONFIG.assetHubPaseo.genesisHash);
    });

    it('should report correct chain status for Paseo', () => {
      const status = apiManager.getStatus(TEST_CONFIG.paseo.key);

      expect(status.isApiConnected).toBe(true);
      expect(status.isApiInitialized).toBe(true);
      expect(status.isApiReady).toBe(true);
      expect(status.apiError).toBeNull();
    });

    it('should report correct chain status for Asset Hub', () => {
      const status = apiManager.getStatus(TEST_CONFIG.assetHubPaseo.key);

      expect(status.isApiConnected).toBe(true);
      expect(status.isApiInitialized).toBe(true);
      expect(status.isApiReady).toBe(true);
      expect(status.apiError).toBeNull();
    });

    it('should resolve API by genesis hash', async () => {
      const api = await apiManager.getApi(TEST_CONFIG.paseo.genesisHash);

      expect(api).toBe(paseoApi);
    });

    it('should resolve API by network key', async () => {
      const api = await apiManager.getApi(TEST_CONFIG.paseo.key);

      expect(api).toBe(paseoApi);
    });

    it('should get all connected APIs', () => {
      const allApis = apiManager.getAllApis();

      expect(Object.keys(allApis)).toContain(TEST_CONFIG.paseo.key);
      expect(Object.keys(allApis)).toContain(TEST_CONFIG.assetHubPaseo.key);
    });
  });

  describe('Chain Properties', () => {
    it(
      'should have correct token symbol for Paseo',
      () => {
        skipIfNotConnected(paseoApi, 'Paseo token symbol');

        const tokenSymbol = paseoApi.registry.chainTokens[0];

        expect(tokenSymbol).toBe(TEST_CONFIG.paseo.nativeToken);
      },
      TIMEOUTS.query
    );

    it(
      'should have correct token decimals for Paseo',
      () => {
        skipIfNotConnected(paseoApi, 'Paseo token decimals');

        const tokenDecimals = paseoApi.registry.chainDecimals[0];

        expect(tokenDecimals).toBe(TEST_CONFIG.paseo.nativeDecimals);
      },
      TIMEOUTS.query
    );

    it(
      'should have correct SS58 format for Paseo',
      () => {
        skipIfNotConnected(paseoApi, 'Paseo SS58 format');

        expect(paseoApi.registry.chainSS58).toBe(TEST_CONFIG.paseo.ss58Format);
      },
      TIMEOUTS.query
    );

    it(
      'should have correct runtime version',
      () => {
        skipIfNotConnected(paseoApi, 'Paseo runtime version');

        const specName = paseoApi.runtimeVersion.specName.toString();

        expect(specName).toBeTruthy();
        expect(typeof specName).toBe('string');
      },
      TIMEOUTS.query
    );
  });

  describe('RPC Queries', () => {
    it(
      'should query system name',
      async () => {
        skipIfNotConnected(paseoApi, 'system name query');

        const systemName = await paseoApi.rpc.system.name();

        expect(systemName.toString()).toBeTruthy();
      },
      TIMEOUTS.query
    );

    it(
      'should query system version',
      async () => {
        skipIfNotConnected(paseoApi, 'system version query');

        const version = await paseoApi.rpc.system.version();

        expect(version.toString()).toBeTruthy();
      },
      TIMEOUTS.query
    );

    it(
      'should query current block hash',
      async () => {
        skipIfNotConnected(paseoApi, 'block hash query');

        const blockHash = await paseoApi.rpc.chain.getBlockHash();

        expect(blockHash.toHex()).toMatch(/^0x[a-f0-9]{64}$/);
      },
      TIMEOUTS.query
    );

    it(
      'should query current block number',
      async () => {
        skipIfNotConnected(paseoApi, 'block number query');

        const header = await paseoApi.rpc.chain.getHeader();
        const blockNumber = header.number.toNumber();

        expect(blockNumber).toBeGreaterThan(0);
      },
      TIMEOUTS.query
    );

    it(
      'should query finalized head',
      async () => {
        skipIfNotConnected(paseoApi, 'finalized head query');

        const finalizedHead = await paseoApi.rpc.chain.getFinalizedHead();

        expect(finalizedHead.toHex()).toMatch(/^0x[a-f0-9]{64}$/);
      },
      TIMEOUTS.query
    );
  });

  describe('State Queries', () => {
    it(
      'should query account info',
      async () => {
        skipIfNotConnected(paseoApi, 'account info query');

        const accountInfo = await paseoApi.query.system.account(TEST_ADDRESSES.alice);

        expect(accountInfo).toBeDefined();
        expect(accountInfo.nonce).toBeDefined();
        expect(accountInfo.data).toBeDefined();
      },
      TIMEOUTS.query
    );

    it(
      'should query multiple accounts in batch',
      async () => {
        skipIfNotConnected(paseoApi, 'batch account query');

        const addresses = [TEST_ADDRESSES.alice, TEST_ADDRESSES.bob, TEST_ADDRESSES.charlie];
        const accountInfos = await paseoApi.query.system.account.multi(addresses);

        expect(accountInfos).toHaveLength(3);
        accountInfos.forEach((info) => {
          expect(info).toBeDefined();
          expect(info.nonce).toBeDefined();
        });
      },
      TIMEOUTS.query
    );

    it(
      'should query runtime metadata',
      async () => {
        skipIfNotConnected(paseoApi, 'metadata query');

        const metadata = await paseoApi.rpc.state.getMetadata();

        expect(metadata).toBeDefined();
        expect(metadata.version).toBeGreaterThan(0);
      },
      TIMEOUTS.query
    );
  });

  describe('Static Utilities', () => {
    it('should resolve chain by key', () => {
      const chain = ApiManager.resolveChain(TEST_CONFIG.paseo.key);

      // Since we use custom endpoint, this might not match exactly
      // Just verify the function works without error
      expect(chain).toBeDefined();
    });

    it('should get singleton instance', () => {
      const instance1 = ApiManager.getInstance();
      const instance2 = ApiManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Subscription', () => {
    it('should subscribe to state changes', async () => {
      let notificationCount = 0;

      const unsubscribe = apiManager.subscribe(() => {
        notificationCount++;
      });

      // Should receive immediate notification
      expect(notificationCount).toBeGreaterThan(0);

      unsubscribe();
    });
  });
});
