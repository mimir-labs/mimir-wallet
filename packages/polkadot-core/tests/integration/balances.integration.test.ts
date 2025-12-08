// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { encodeAddress } from '@polkadot/util-crypto';
import { describe, expect, it } from 'vitest';

import { fetchNativeBalances } from '../../src/balances/fetchNativeBalances.js';

import { assetHubApi, paseoApi, skipIfNotConnected } from './setup.js';
import { TEST_ADDRESSES, TEST_CONFIG, TIMEOUTS } from './test-config.js';

describe('Balances Integration Tests', () => {
  describe('Native Balance Queries', () => {
    it(
      'should fetch native balance on Paseo relay chain',
      async () => {
        skipIfNotConnected(paseoApi, 'Paseo native balance');

        const balance = await fetchNativeBalances(
          paseoApi,
          TEST_ADDRESSES.aliceHex,
        );

        expect(balance).toBeDefined();
        expect(balance?.key).toBe('native');
        expect(typeof balance?.total).toBe('bigint');
        expect(typeof balance?.free).toBe('bigint');
        expect(typeof balance?.reserved).toBe('bigint');
        expect(typeof balance?.locked).toBe('bigint');
        expect(typeof balance?.transferrable).toBe('bigint');
      },
      TIMEOUTS.query,
    );

    it(
      'should fetch native balance on Asset Hub Paseo',
      async () => {
        skipIfNotConnected(assetHubApi, 'Asset Hub native balance');

        const balance = await fetchNativeBalances(
          assetHubApi,
          TEST_ADDRESSES.aliceHex,
        );

        expect(balance).toBeDefined();
        expect(balance?.key).toBe('native');
        expect(typeof balance?.total).toBe('bigint');
      },
      TIMEOUTS.query,
    );

    it(
      'should have consistent balance values (total = free + reserved)',
      async () => {
        skipIfNotConnected(paseoApi, 'balance consistency');

        const balance = await fetchNativeBalances(
          paseoApi,
          TEST_ADDRESSES.aliceHex,
        );

        if (balance) {
          // Total should equal free + reserved
          expect(balance.total).toBe(balance.free + balance.reserved);

          // Transferrable should be <= free
          expect(balance.transferrable).toBeLessThanOrEqual(balance.free);
        }
      },
      TIMEOUTS.query,
    );

    it(
      'should handle non-existent account gracefully',
      async () => {
        skipIfNotConnected(paseoApi, 'non-existent account');

        // Generate a random hex address that doesn't exist
        const randomHex =
          '0x0000000000000000000000000000000000000000000000000000000000000001' as HexString;
        const balance = await fetchNativeBalances(paseoApi, randomHex);

        // Should return a balance (possibly zero) without throwing
        expect(balance).toBeDefined();
        expect(balance?.key).toBe('native');
      },
      TIMEOUTS.query,
    );
  });

  describe('Direct API Balance Queries', () => {
    it(
      'should query system.account directly',
      async () => {
        skipIfNotConnected(paseoApi, 'system.account query');

        const accountInfo = await paseoApi.query.system.account(
          TEST_ADDRESSES.alice,
        );

        expect(accountInfo).toBeDefined();
        expect(accountInfo.nonce).toBeDefined();
        expect(accountInfo.data).toBeDefined();
        expect(accountInfo.data.free).toBeDefined();
        expect(accountInfo.data.reserved).toBeDefined();
        expect(accountInfo.data.frozen).toBeDefined();
      },
      TIMEOUTS.query,
    );

    it(
      'should query multiple accounts using multi',
      async () => {
        skipIfNotConnected(paseoApi, 'multi account query');

        const addresses = [TEST_ADDRESSES.alice, TEST_ADDRESSES.bob];
        const accounts = await paseoApi.query.system.account.multi(addresses);

        expect(accounts).toHaveLength(2);
        accounts.forEach((accountInfo) => {
          expect(accountInfo.data).toBeDefined();
        });
      },
      TIMEOUTS.query,
    );

    it(
      'should verify balance format matches chain decimals',
      async () => {
        skipIfNotConnected(paseoApi, 'balance format');

        const accountInfo = await paseoApi.query.system.account(
          TEST_ADDRESSES.alice,
        );
        const free = accountInfo.data.free.toString();

        // Balance should be a valid number string
        expect(() => BigInt(free)).not.toThrow();
      },
      TIMEOUTS.query,
    );
  });

  describe('Address Format Handling', () => {
    it(
      'should handle SS58 encoded address',
      async () => {
        skipIfNotConnected(paseoApi, 'SS58 address');

        // Query with SS58 address directly
        const accountInfo = await paseoApi.query.system.account(
          TEST_ADDRESSES.alice,
        );

        expect(accountInfo.data).toBeDefined();
      },
      TIMEOUTS.query,
    );

    it(
      'should handle hex encoded address',
      async () => {
        skipIfNotConnected(paseoApi, 'hex address');

        // Query with hex address
        const accountInfo = await paseoApi.query.system.account(
          TEST_ADDRESSES.aliceHex,
        );

        expect(accountInfo.data).toBeDefined();
      },
      TIMEOUTS.query,
    );

    it(
      'should get same result for SS58 and hex address',
      async () => {
        skipIfNotConnected(paseoApi, 'address consistency');

        const ss58Result = await paseoApi.query.system.account(
          TEST_ADDRESSES.alice,
        );
        const hexResult = await paseoApi.query.system.account(
          TEST_ADDRESSES.aliceHex,
        );

        // Both should return the same balance
        expect(ss58Result.data.free.toString()).toBe(
          hexResult.data.free.toString(),
        );
        expect(ss58Result.data.reserved.toString()).toBe(
          hexResult.data.reserved.toString(),
        );
      },
      TIMEOUTS.query,
    );

    it(
      'should convert hex to SS58 correctly',
      () => {
        const converted = encodeAddress(
          TEST_ADDRESSES.aliceHex,
          TEST_CONFIG.paseo.ss58Format,
        );

        // With ss58Format 0, Alice should be in the generic format
        expect(converted).toBeTruthy();
        expect(typeof converted).toBe('string');
      },
      TIMEOUTS.query,
    );
  });

  describe('Existential Deposit', () => {
    it(
      'should query existential deposit constant',
      async () => {
        skipIfNotConnected(paseoApi, 'existential deposit');

        const existentialDeposit = paseoApi.consts.balances?.existentialDeposit;

        if (existentialDeposit) {
          const ed = BigInt(existentialDeposit.toString());

          expect(ed).toBeGreaterThan(0n);
        }
      },
      TIMEOUTS.query,
    );
  });

  describe('Total Issuance', () => {
    it(
      'should query total issuance',
      async () => {
        skipIfNotConnected(paseoApi, 'total issuance');

        const totalIssuance = await paseoApi.query.balances.totalIssuance();
        const issuance = BigInt(totalIssuance.toString());

        expect(issuance).toBeGreaterThan(0n);
      },
      TIMEOUTS.query,
    );
  });
});
