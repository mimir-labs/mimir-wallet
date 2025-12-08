// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { dryRun } from '../../src/dry-run/dryRun.js';

import { assetHubApi, paseoApi, skipIfNotConnected } from './setup.js';
import { TEST_ADDRESSES, TIMEOUTS } from './test-config.js';

describe('Dry Run Integration Tests', () => {
  describe('Dry Run API Availability', () => {
    it(
      'should have dry run API available on Paseo',
      async () => {
        skipIfNotConnected(paseoApi, 'Paseo dry run API');

        const hasDryRunApi = !!paseoApi.call.dryRunApi?.dryRunCall;

        expect(hasDryRunApi).toBe(true);
      },
      TIMEOUTS.query,
    );

    it(
      'should have dry run API available on Asset Hub',
      async () => {
        skipIfNotConnected(assetHubApi, 'Asset Hub dry run API');

        const hasDryRunApi = !!assetHubApi.call.dryRunApi?.dryRunCall;

        expect(hasDryRunApi).toBe(true);
      },
      TIMEOUTS.query,
    );
  });

  describe('Dry Run System Calls', () => {
    it(
      'should dry run system.remark call successfully',
      async () => {
        skipIfNotConnected(paseoApi, 'system.remark dry run');

        const remarkCall = paseoApi.tx.system.remark('test remark');
        const result = await dryRun(
          paseoApi,
          remarkCall.method,
          TEST_ADDRESSES.alice,
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.rawEvents).toBeDefined();
        expect(Array.isArray(result.rawEvents)).toBe(true);
      },
      TIMEOUTS.dryRun,
    );

    it(
      'should dry run system.remarkWithEvent call',
      async () => {
        skipIfNotConnected(paseoApi, 'system.remarkWithEvent dry run');

        const remarkCall = paseoApi.tx.system.remarkWithEvent(
          'test remark with event',
        );
        const result = await dryRun(
          paseoApi,
          remarkCall.method,
          TEST_ADDRESSES.alice,
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.rawEvents).toBeDefined();
      },
      TIMEOUTS.dryRun,
    );
  });

  describe('Dry Run Balance Transfer', () => {
    it(
      'should dry run balances.transferKeepAlive call',
      async () => {
        skipIfNotConnected(paseoApi, 'balances.transferKeepAlive dry run');

        // Create a transfer call for 1 PAS (10 decimals)
        const transferAmount = BigInt(1_000_000_0000); // 1 PAS
        const transferCall = paseoApi.tx.balances.transferKeepAlive(
          TEST_ADDRESSES.bob,
          transferAmount,
        );

        const result = await dryRun(
          paseoApi,
          transferCall.method,
          TEST_ADDRESSES.alice,
        );

        expect(result).toBeDefined();
        expect(result.rawEvents).toBeDefined();

        // The result may succeed or fail depending on Alice's balance on Paseo
        // We just verify the dry run executes without throwing
        if (result.success) {
          expect(result.balancesChanges).toBeDefined();
        }
      },
      TIMEOUTS.dryRun,
    );

    it(
      'should detect insufficient balance in dry run',
      async () => {
        skipIfNotConnected(paseoApi, 'insufficient balance dry run');

        // Create a transfer call for an extremely large amount
        const largeAmount = BigInt('999999999999999999999999999');
        const transferCall = paseoApi.tx.balances.transferKeepAlive(
          TEST_ADDRESSES.bob,
          largeAmount,
        );

        const result = await dryRun(
          paseoApi,
          transferCall.method,
          TEST_ADDRESSES.alice,
        );

        expect(result).toBeDefined();
        // This should fail due to insufficient balance
        expect(result.success).toBe(false);

        if (!result.success) {
          expect(result.error).toBeDefined();
        }
      },
      TIMEOUTS.dryRun,
    );
  });

  describe('Dry Run with Hex Encoded Call', () => {
    it(
      'should dry run with hex encoded call data',
      async () => {
        skipIfNotConnected(paseoApi, 'hex call dry run');

        const remarkCall = paseoApi.tx.system.remark('hex test');
        const callHex = remarkCall.method.toHex();

        const result = await dryRun(paseoApi, callHex, TEST_ADDRESSES.alice);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      },
      TIMEOUTS.dryRun,
    );
  });

  describe('Dry Run Events Parsing', () => {
    it(
      'should parse events from dry run result',
      async () => {
        skipIfNotConnected(paseoApi, 'events parsing');

        const remarkCall =
          paseoApi.tx.system.remarkWithEvent('event parsing test');
        const result = await dryRun(
          paseoApi,
          remarkCall.method,
          TEST_ADDRESSES.alice,
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.rawEvents).toBeDefined();

        // Check that we have at least some events
        if (Array.isArray(result.rawEvents) && result.rawEvents.length > 0) {
          const hasSystemEvent = result.rawEvents.some(
            (event: any) =>
              event?.section === 'System' || event?.section === 'system',
          );

          expect(hasSystemEvent).toBe(true);
        }
      },
      TIMEOUTS.dryRun,
    );
  });

  describe('Dry Run on Asset Hub', () => {
    it(
      'should dry run system.remark on Asset Hub',
      async () => {
        skipIfNotConnected(assetHubApi, 'Asset Hub dry run');

        const remarkCall = assetHubApi.tx.system.remark('asset hub test');
        const result = await dryRun(
          assetHubApi,
          remarkCall.method,
          TEST_ADDRESSES.alice,
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      },
      TIMEOUTS.dryRun,
    );
  });

  describe('Dry Run XCM Information', () => {
    it(
      'should include XCM related fields in result',
      async () => {
        skipIfNotConnected(paseoApi, 'XCM fields');

        const remarkCall = paseoApi.tx.system.remark('xcm test');
        const result = await dryRun(
          paseoApi,
          remarkCall.method,
          TEST_ADDRESSES.alice,
        );

        expect(result).toBeDefined();

        if (result.success) {
          // These fields should be present in successful results
          expect('localXcm' in result).toBe(true);
          expect('forwardedXcms' in result).toBe(true);
        }
      },
      TIMEOUTS.dryRun,
    );
  });
});
