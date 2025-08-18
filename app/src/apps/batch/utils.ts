// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@/hooks/types';
import type { Registry } from '@polkadot/types/types';

import { findAction, parseCall } from '@mimir-wallet/polkadot-core';

/**
 * Check if a transaction is a utility.batchAll transaction
 */
export function isBatchAllTransaction(item: BatchTxItem, registry: Registry): boolean {
  try {
    const call = parseCall(registry, item.calldata);

    if (!call) return false;

    const action = findAction(registry, call);

    return action?.join('.') === 'utility.batchAll';
  } catch {
    return false;
  }
}

/**
 * Filter out utility.batchAll transactions from a list
 */
export function filterOutBatchAllTransactions(items: BatchTxItem[], registry: Registry): BatchTxItem[] {
  return items.filter((item) => !isBatchAllTransaction(item, registry));
}

/**
 * Check if any of the items is a utility.batchAll transaction
 */
export function hasBatchAllTransaction(items: BatchTxItem[], registry: Registry): boolean {
  return items.some((item) => isBatchAllTransaction(item, registry));
}

/**
 * Check if any of the items is NOT a utility.batchAll transaction
 */
export function hasNormalTransaction(items: BatchTxItem[], registry: Registry): boolean {
  return items.some((item) => !isBatchAllTransaction(item, registry));
}

/**
 * Calculate selection constraints for a transaction
 */
export function calculateSelectionConstraints(
  item: BatchTxItem,
  selectedItems: BatchTxItem[],
  registry: Registry,
  isSelected: boolean
) {
  const isBatchAll = isBatchAllTransaction(item, registry);
  const hasBatchAllSelected = selectedItems.some((tx) => isBatchAllTransaction(tx, registry));
  const hasNormalSelected = selectedItems.some((tx) => !isBatchAllTransaction(tx, registry));

  // Disable selection if:
  // 1. This is a batchAll and normal transactions are selected
  // 2. This is a normal transaction and batchAll transactions are selected
  // 3. This is a batchAll and another batchAll is already selected (only one batchAll allowed)
  const isDisabled =
    (isBatchAll && hasNormalSelected) ||
    (!isBatchAll && hasBatchAllSelected) ||
    (isBatchAll && hasBatchAllSelected && !isSelected);

  const disabledReason = isDisabled
    ? 'According to on-chain rules, Batch All transactions cannot be nested.'
    : undefined;

  return { isDisabled, disabledReason };
}
