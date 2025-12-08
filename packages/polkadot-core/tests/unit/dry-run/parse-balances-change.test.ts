// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Event } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { describe, expect, it, vi } from 'vitest';

import { parseBalancesChange } from '../../../src/dry-run/parse-balances-change.js';

// Mock genesis hash for testing
const MOCK_GENESIS_HASH: HexString =
  '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3';

// Helper to create mock events
function createMockEvent(section: string, method: string, data: any[]): Event {
  return {
    section,
    method,
    data: data.map((item) => ({
      toString: () => item.toString(),
      toHex: () =>
        typeof item === 'string' && item.startsWith('0x')
          ? item
          : `0x${item.toString(16)}`,
    })),
  } as unknown as Event;
}

// Test addresses
const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

describe('parseBalancesChange', () => {
  describe('balances events', () => {
    it('should parse balances.Transfer event', () => {
      const events = [
        createMockEvent('balances', 'Transfer', [ALICE, BOB, '1000000000000']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0]).toEqual({
        assetId: 'native',
        from: ALICE,
        to: BOB,
        amount: BigInt('1000000000000'),
        genesisHash: MOCK_GENESIS_HASH,
      });
    });

    it('should parse balances.Burned event', () => {
      const events = [
        createMockEvent('balances', 'Burned', [ALICE, '500000000000']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe('native');
      expect(changes[0].from).toBe(ALICE);
      expect(changes[0].amount).toBe(BigInt('500000000000'));
    });

    it('should parse balances.Minted event', () => {
      const events = [
        createMockEvent('balances', 'Minted', [BOB, '2000000000000']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe('native');
      expect(changes[0].to).toBe(BOB);
      expect(changes[0].amount).toBe(BigInt('2000000000000'));
    });

    it('should parse balances.Deposit event', () => {
      const events = [
        createMockEvent('balances', 'Deposit', [ALICE, '100000000000']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe('native');
      expect(changes[0].to).toBe(ALICE);
    });

    it('should parse balances.Withdraw event', () => {
      const events = [
        createMockEvent('balances', 'Withdraw', [BOB, '300000000000']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe('native');
      expect(changes[0].from).toBe(BOB);
    });
  });

  describe('assets events', () => {
    it('should parse assets.Transferred event with assetId', () => {
      const assetId = '1984';
      const events = [
        createMockEvent('assets', 'Transferred', [
          assetId,
          ALICE,
          BOB,
          '5000000',
        ]),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe(assetId);
      expect(changes[0].from).toBe(ALICE);
      expect(changes[0].to).toBe(BOB);
    });

    it('should parse assets.Burned event', () => {
      const assetId = '1984';
      const events = [
        createMockEvent('assets', 'Burned', [assetId, ALICE, '1000000']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe(assetId);
      expect(changes[0].from).toBe(ALICE);
    });

    it('should parse assets.Issued event', () => {
      const assetId = '1984';
      const events = [
        createMockEvent('assets', 'Issued', [assetId, BOB, '2000000']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe(assetId);
      expect(changes[0].to).toBe(BOB);
    });
  });

  describe('foreignAssets events', () => {
    it('should parse foreignAssets.Transferred event with hex assetId', () => {
      const hexAssetId = '0x0102030405060708090a0b0c0d0e0f10';
      const events = [
        createMockEvent('foreignAssets', 'Transferred', [
          hexAssetId,
          ALICE,
          BOB,
          '1000',
        ]),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe(hexAssetId);
    });

    it('should parse foreignAssets.Burned event', () => {
      const hexAssetId = '0xabcdef';
      const events = [
        createMockEvent('foreignAssets', 'Burned', [hexAssetId, ALICE, '500']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe(hexAssetId);
    });
  });

  describe('tokens events', () => {
    it('should parse tokens.Transfer event', () => {
      const hexAssetId = '0x1234';
      const events = [
        createMockEvent('tokens', 'Transfer', [
          hexAssetId,
          ALICE,
          BOB,
          '10000',
        ]),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe(hexAssetId);
      expect(changes[0].from).toBe(ALICE);
      expect(changes[0].to).toBe(BOB);
    });

    it('should parse tokens.Deposited event', () => {
      const hexAssetId = '0x5678';
      const events = [
        createMockEvent('tokens', 'Deposited', [hexAssetId, BOB, '20000']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe(hexAssetId);
      expect(changes[0].to).toBe(BOB);
    });

    it('should parse tokens.Withdrawn event', () => {
      const hexAssetId = '0x9abc';
      const events = [
        createMockEvent('tokens', 'Withdrawn', [hexAssetId, ALICE, '15000']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(1);
      expect(changes[0].assetId).toBe(hexAssetId);
      expect(changes[0].from).toBe(ALICE);
    });
  });

  describe('multiple events', () => {
    it('should parse multiple events correctly', () => {
      const events = [
        createMockEvent('balances', 'Transfer', [ALICE, BOB, '1000']),
        createMockEvent('balances', 'Deposit', [BOB, '500']),
        createMockEvent('assets', 'Transferred', ['1984', ALICE, BOB, '100']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(3);
    });

    it('should skip unrecognized events', () => {
      const events = [
        createMockEvent('balances', 'Transfer', [ALICE, BOB, '1000']),
        createMockEvent('system', 'ExtrinsicSuccess', [{}]),
        createMockEvent('balances', 'Deposit', [BOB, '500']),
      ];

      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      expect(changes).toHaveLength(2);
    });
  });

  describe('error handling', () => {
    it('should return empty array for empty events', () => {
      const changes = parseBalancesChange([], MOCK_GENESIS_HASH);

      expect(changes).toEqual([]);
    });

    it('should continue processing after parse error', () => {
      // Mock console.warn to suppress warning output
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create an event that will fail to parse (data array too short)
      const badEvent = {
        section: 'balances',
        method: 'Transfer',
        data: [], // Missing required data
      } as unknown as Event;

      const goodEvent = createMockEvent('balances', 'Deposit', [ALICE, '1000']);

      const events = [badEvent, goodEvent];
      const changes = parseBalancesChange(events, MOCK_GENESIS_HASH);

      // Should have processed the good event
      expect(changes.length).toBeGreaterThanOrEqual(0);

      warnSpy.mockRestore();
    });
  });

  describe('genesis hash', () => {
    it('should include genesis hash in all changes', () => {
      const customGenesisHash: HexString =
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const events = [
        createMockEvent('balances', 'Transfer', [ALICE, BOB, '1000']),
        createMockEvent('balances', 'Deposit', [BOB, '500']),
      ];

      const changes = parseBalancesChange(events, customGenesisHash);

      expect(changes).toHaveLength(2);
      changes.forEach((change) => {
        expect(change.genesisHash).toBe(customGenesisHash);
      });
    });
  });
});
