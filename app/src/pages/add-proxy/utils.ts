// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from '@/constants';

/**
 * Proxy type descriptions for UI display
 */
export const proxyTypeDescriptions: Record<string, string> = {
  Any: 'The proxy can do anything you can do',
  NonTransfer: 'Everything except sending your tokens',
  Governance: 'Only voting and democracy actions',
  Staking: 'Only staking, nominating, and rewards',
  IdentityJudgement: 'Only certify identities (for registrars)',
  CancelProxy: 'Only cancel delayed proxy announcements'
};

/**
 * Estimate time from custom blocks
 */
export function estimateTimeFromBlocks(customBlocks: string, blockInterval: number): string {
  const blocks = Number(customBlocks);
  const timeMs = blocks * blockInterval;

  if (timeMs > ONE_DAY * 1000) {
    return `About ${Math.round(timeMs / (ONE_DAY * 1000))} days`;
  }

  if (timeMs > ONE_HOUR * 1000) {
    return `About ${Math.round(timeMs / (ONE_HOUR * 1000))} hours`;
  }

  return `About ${Math.round(timeMs / (ONE_MINUTE * 1000))} minutes`;
}

/**
 * Filter accounts by network for proxy operations
 */
export function filterAccountsByNetwork(accounts: AccountData[], genesisHash: HexString): string[] {
  return accounts
    .filter((account) => (account.type === 'pure' ? account.network === genesisHash : true))
    .map((item) => item.address);
}

export const DEFAULT_PURE_ACCOUNT_NAME = 'Pure Proxy Account';
