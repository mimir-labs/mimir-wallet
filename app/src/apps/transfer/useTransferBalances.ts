// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OrmlTokensAccountData } from '@/hooks/types';
import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import type { TransferToken } from './types';

import { useApi } from '@/hooks/useApi';
import { type BN, BN_ZERO, isHex } from '@polkadot/util';
import { useQuery } from '@tanstack/react-query';

async function _getNativeBalance(api: ApiPromise, address: string): Promise<BN> {
  return api.derive.balances.all(address).then((result) => result.availableBalance);
}

async function _getAssetBalance(api: ApiPromise, address: string, assetId: string): Promise<BN> {
  if (api.query.assets || api.query.foreignAssets) {
    return isHex(assetId)
      ? api.query.foreignAssets.account(assetId, address).then((result) => {
          return (result as Option<PalletAssetsAssetAccount>).unwrapOrDefault().balance;
        })
      : api.query.assets.account(assetId, address).then((result) => {
          return (result as Option<PalletAssetsAssetAccount>).unwrapOrDefault().balance;
        });
  }

  return api.query.tokens.accounts(address, assetId).then((result) => {
    return (result as unknown as OrmlTokensAccountData).free.sub((result as unknown as OrmlTokensAccountData).frozen);
  });
}

function _retrieveBalance({
  queryKey: [api, address, token]
}: {
  queryKey: [api: ApiPromise, address?: string, token?: TransferToken];
}): Promise<BN> {
  if (!(address && token)) {
    return Promise.resolve(BN_ZERO);
  }

  if (token?.isNative) {
    return _getNativeBalance(api, address);
  }

  return _getAssetBalance(api, address, token.assetId);
}

export function useTransferBalance(
  token?: TransferToken,
  sender?: string
): [format: [decimals: number, symbol: string], sendingBalance: BN, isFetched: boolean, isFetching: boolean] {
  const { api, isApiReady } = useApi();
  const { data, isFetching, isFetched } = useQuery({
    queryKey: [api, sender, token] as const,
    queryHash: `_retrieveBalance.${api.genesisHash.toHex()}-${sender}-${token?.isNative ? 'native' : token?.assetId}.sender`,
    queryFn: _retrieveBalance,
    refetchInterval: 60000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: isApiReady && !!sender && !!token
  });

  return [token ? [token.decimals, token.symbol] : [0, ''], data ?? BN_ZERO, isFetched, isFetching];
}
