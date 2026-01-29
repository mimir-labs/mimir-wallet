// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TokenNetworkItem, TokenNetworkValue } from './types';

/**
 * Format USD value for display
 * @param value - USD value as number
 * @returns Formatted string (e.g., "$1,234.56" or "< $0.01")
 */
export function formatUsdValue(value: number): string {
  if (value === 0) {
    return '$0.00';
  }

  if (value < 0.01) {
    return '< $0.01';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Create unique key for token+network combination
 * @param network - Network key
 * @param identifier - Token identifier
 * @returns Unique string key
 */
export function createTokenNetworkKey(
  network: string,
  identifier: string,
): string {
  return `${network}:${identifier}`;
}

/**
 * Calculate USD value from token balance
 * @param balance - Token balance as bigint
 * @param decimals - Token decimals
 * @param price - Token price in USD
 * @returns USD value as number
 */
export function calculateUsdValue(
  balance: bigint,
  decimals: number,
  price?: number,
): number {
  if (!price || price <= 0 || balance <= 0n) {
    return 0;
  }

  return (Number(balance) / Math.pow(10, decimals)) * price;
}

/**
 * Filter items by search query
 * @param items - Token network items to filter
 * @param query - Search query string
 * @returns Filtered items
 */
export function filterBySearch(
  items: TokenNetworkItem[],
  query: string,
): TokenNetworkItem[] {
  if (!query.trim()) {
    return items;
  }

  const lowerQuery = query.toLowerCase().trim();

  return items.filter((item) => {
    const tokenName = item.token.name?.toLowerCase() || '';
    const tokenSymbol = item.token.symbol?.toLowerCase() || '';
    const networkName = item.network.name?.toLowerCase() || '';

    return (
      tokenName.includes(lowerQuery) ||
      tokenSymbol.includes(lowerQuery) ||
      networkName.includes(lowerQuery)
    );
  });
}

/**
 * Filter items by network
 * @param items - Token network items to filter
 * @param networkKey - Network key to filter by, or null for all
 * @returns Filtered items
 */
export function filterByNetwork(
  items: TokenNetworkItem[],
  networkKey: string | null,
): TokenNetworkItem[] {
  if (!networkKey) {
    return items;
  }

  return items.filter((item) => item.network.key === networkKey);
}

/**
 * Sort items with balance priority
 * Tokens with balance first, then by USD value, then by price availability, finally by symbol
 * @param items - Token network items to sort
 * @returns Sorted items (new array)
 */
export function sortWithBalancePriority(
  items: TokenNetworkItem[],
): TokenNetworkItem[] {
  return [...items].sort((a, b) => {
    // Tokens with balance first
    const aHasBalance = a.token.transferrable > 0n;
    const bHasBalance = b.token.transferrable > 0n;

    if (aHasBalance !== bHasBalance) return bHasBalance ? 1 : -1;

    // Then by USD value
    if (a.usdValue !== b.usdValue) return b.usdValue - a.usdValue;

    // Then by price availability
    const aHasPrice = a.token.price && a.token.price > 0;
    const bHasPrice = b.token.price && b.token.price > 0;

    if (aHasPrice !== bHasPrice) return bHasPrice ? 1 : -1;

    // Finally by symbol
    return (a.token.symbol || '').localeCompare(b.token.symbol || '');
  });
}

/**
 * Check if two TokenNetworkValue are equal
 * @param a - First value
 * @param b - Second value
 * @returns true if equal
 */
export function isTokenNetworkValueEqual(
  a?: TokenNetworkValue,
  b?: TokenNetworkValue,
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return a.network === b.network && a.identifier === b.identifier;
}

/**
 * Find item matching a TokenNetworkValue
 * @param items - Items to search
 * @param value - Value to find
 * @returns Matching item or undefined
 */
export function findItemByValue(
  items: TokenNetworkItem[],
  value?: TokenNetworkValue,
): TokenNetworkItem | undefined {
  if (!value) return undefined;

  return items.find(
    (item) =>
      item.network.key === value.network &&
      (item.token.isNative
        ? value.identifier === 'native'
        : item.token.key === value.identifier),
  );
}

/**
 * Convert TokenNetworkItem to TokenNetworkValue
 * @param item - Item to convert
 * @returns TokenNetworkValue representation
 */
export function itemToValue(item: TokenNetworkItem): TokenNetworkValue {
  return {
    network: item.network.key,
    identifier: item.token.isNative ? 'native' : item.token.key,
  };
}
