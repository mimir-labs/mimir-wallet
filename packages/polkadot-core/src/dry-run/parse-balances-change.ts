// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Event } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';
import type { BalanceChange } from './types.js';

import { encodeAddress } from '../defaults.js';

// Constants
const ZERO_ADDRESS_HEX = '0x0000000000000000000000000000000000000000000000000000000000000000';
const DEFAULT_SS58_FORMAT = 42;
const zeroAddress = encodeAddress(ZERO_ADDRESS_HEX, DEFAULT_SS58_FORMAT);

// Event handler configuration for different asset types
interface EventHandler {
  getAssetId: (event: Event) => string;
  getFrom: (event: Event) => string;
  getTo: (event: Event) => string;
  getAmount: (event: Event) => bigint;
}

interface EventConfig {
  section: string;
  method: string;
  handler: EventHandler;
}

// Helper functions for extracting data from events
const extractAssetId = (event: Event, index: number, isHex = false): string => {
  if (index === -1) return 'native';

  return isHex ? event.data[index].toHex() : event.data[index].toString();
};

const extractAddress = (event: Event, index: number): string => event.data[index].toString();

const extractAmount = (event: Event, index: number): bigint => BigInt(event.data[index].toString());

// Factory function to create standard event handlers
function createTransferHandler(
  assetIdIndex: number,
  fromIndex: number,
  toIndex: number,
  amountIndex: number,
  isHexAsset = false
): EventHandler {
  return {
    getAssetId: (event) => extractAssetId(event, assetIdIndex, isHexAsset),
    getFrom: (event) => extractAddress(event, fromIndex),
    getTo: (event) => extractAddress(event, toIndex),
    getAmount: (event) => extractAmount(event, amountIndex)
  };
}

function createBurnHandler(
  assetIdIndex: number,
  fromIndex: number,
  amountIndex: number,
  isHexAsset = false
): EventHandler {
  return {
    getAssetId: (event) => extractAssetId(event, assetIdIndex, isHexAsset),
    getFrom: (event) => extractAddress(event, fromIndex),
    getTo: () => zeroAddress,
    getAmount: (event) => extractAmount(event, amountIndex)
  };
}

function createMintHandler(
  assetIdIndex: number,
  toIndex: number,
  amountIndex: number,
  isHexAsset = false
): EventHandler {
  return {
    getAssetId: (event) => extractAssetId(event, assetIdIndex, isHexAsset),
    getFrom: () => zeroAddress,
    getTo: (event) => extractAddress(event, toIndex),
    getAmount: (event) => extractAmount(event, amountIndex)
  };
}

// Configuration mapping for all supported events
const EVENT_CONFIGS: EventConfig[] = [
  // Native balance events
  { section: 'balances', method: 'Transfer', handler: createTransferHandler(-1, 0, 1, 2) },
  { section: 'balances', method: 'Burned', handler: createBurnHandler(-1, 0, 1) },
  { section: 'balances', method: 'Minted', handler: createMintHandler(-1, 0, 1) },
  { section: 'balances', method: 'Deposit', handler: createMintHandler(-1, 0, 1) },
  { section: 'balances', method: 'Withdraw', handler: createBurnHandler(-1, 0, 1) },

  // Asset events
  { section: 'assets', method: 'Transferred', handler: createTransferHandler(0, 1, 2, 3) },
  { section: 'assets', method: 'Burned', handler: createBurnHandler(0, 1, 2) },
  { section: 'assets', method: 'Issued', handler: createMintHandler(0, 1, 2) },
  { section: 'assets', method: 'Deposited', handler: createMintHandler(0, 1, 2) },
  { section: 'assets', method: 'Withdrawn', handler: createBurnHandler(0, 1, 2) },

  // Foreign asset events (using hex asset IDs)
  { section: 'foreignAssets', method: 'Transferred', handler: createTransferHandler(0, 1, 2, 3, true) },
  { section: 'foreignAssets', method: 'Burned', handler: createBurnHandler(0, 1, 2, true) },
  { section: 'foreignAssets', method: 'Issued', handler: createMintHandler(0, 1, 2, true) },
  { section: 'foreignAssets', method: 'Deposited', handler: createMintHandler(0, 1, 2, true) },
  { section: 'foreignAssets', method: 'Withdrawn', handler: createBurnHandler(0, 1, 2, true) },

  // Token events (using hex asset IDs)
  { section: 'tokens', method: 'Transfer', handler: createTransferHandler(0, 1, 2, 3, true) },
  { section: 'tokens', method: 'Deposited', handler: createMintHandler(0, 1, 2, true) },
  { section: 'tokens', method: 'Withdrawn', handler: createBurnHandler(0, 1, 2, true) }
];

// Create a lookup map for faster event processing
const EVENT_LOOKUP = new Map<string, EventHandler>();

for (const config of EVENT_CONFIGS) {
  EVENT_LOOKUP.set(`${config.section}.${config.method}`, config.handler);
}

/**
 * Parses balance change events from a collection of blockchain events
 * @param events - Array of blockchain events to parse
 * @param genesisHash - The genesis hash of the chain
 * @returns Array of parsed balance changes
 */
export function parseBalancesChange(events: Event[], genesisHash: HexString): BalanceChange[] {
  const changes: BalanceChange[] = [];

  for (const event of events) {
    const eventKey = `${event.section}.${event.method}`;
    const handler = EVENT_LOOKUP.get(eventKey);

    if (handler) {
      try {
        changes.push({
          assetId: handler.getAssetId(event),
          from: handler.getFrom(event),
          to: handler.getTo(event),
          amount: handler.getAmount(event),
          genesisHash
        });
      } catch (error) {
        // Log error but continue processing other events
        logParseError(eventKey, error);
      }
    }
  }

  return changes;
}

/**
 * Logs parsing errors in development environment
 * @param eventKey - The event identifier that failed to parse
 * @param error - The error that occurred
 */
function logParseError(eventKey: string, error: unknown): void {
  console.warn(`Failed to parse balance change for event ${eventKey}:`, error);
}
