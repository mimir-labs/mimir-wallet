// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransferToken } from './types';

import { useNetwork } from '@mimir-wallet/polkadot-core';
import { BN, BN_ZERO } from '@polkadot/util';

import { useBalanceByIdentifier } from '@/hooks/useChainBalances';

export function useTransferBalance(
  token?: TransferToken,
  sender?: string,
): [
  format: [decimals: number, symbol: string],
  sendingBalance: BN,
  isFetched: boolean,
  isFetching: boolean,
] {
  const { network } = useNetwork();

  // Convert token to identifier format
  const identifier = token
    ? token.isNative
      ? 'native'
      : token.assetId
    : undefined;

  // Use modern balance hook
  const [balanceData, isFetched, isFetching] = useBalanceByIdentifier(
    network,
    sender,
    identifier,
  );

  // Extract transferrable balance as BN
  const sendingBalance = balanceData?.transferrable
    ? new BN(balanceData.transferrable.toString())
    : BN_ZERO;

  // Return format information from token
  const format: [number, string] = token
    ? [token.decimals, token.symbol]
    : [0, ''];

  return [format, sendingBalance, isFetched, isFetching];
}
