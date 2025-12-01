// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CompleteEnhancedAssetInfo } from '@mimir-wallet/service';
import type { HexString } from '@polkadot/util/types';

/**
 * Account asset balance information based on XCM enhanced asset data
 */
export type AccountEnhancedAssetBalance = CompleteEnhancedAssetInfo & {
  /** Account address holding this asset */
  address: HexString;
  /** Total balance (free + reserved) */
  total: bigint;
  /** Locked/frozen balance */
  locked: bigint;
  /** Reserved balance */
  reserved: bigint;
  /** Free balance */
  free: bigint;
  /** Transferrable balance */
  transferrable: bigint;
};

/**
 * Balance fetch result with key identifier
 */
export interface BalanceResult {
  /** Asset key identifier (hex-encoded) */
  key: string;
  /** Total balance (free + reserved) */
  total: bigint;
  /** Locked/frozen balance */
  locked: bigint;
  /** Reserved balance */
  reserved: bigint;
  /** Free balance */
  free: bigint;
  /** Transferrable balance */
  transferrable: bigint;
}
