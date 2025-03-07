// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { AccountId, AccountId32 } from '@polkadot/types/interfaces';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import type { AccountAssetInfo, AccountBalance, AssetInfo, OrmlTokensAccountData } from './types';

import { BN_ZERO, isHex } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';
import { useQuery } from '@tanstack/react-query';

import { useApi } from './useApi';
import { useAssets } from './useAssets';

async function getBalances({ queryKey }: { queryKey: [ApiPromise, string | undefined | null] }) {
  const [api, address] = queryKey;

  if (!address) {
    throw new Error('Address is required');
  }

  return Promise.all([api.query.system.account(address)]).then(([account]) => ({
    total: account.data.free.add(account.data.reserved),
    reserved: account.data.reserved,
    locked: account.data.frozen,
    free: account.data.free,
    transferrable: account.data.free.add(account.data.reserved).sub(account.data.frozen)
  }));
}

export function useNativeBalances(
  address?: AccountId | AccountId32 | string | null
): [AccountBalance | undefined, boolean, boolean] {
  const { api, isApiReady } = useApi();
  const queryHash = blake2AsHex(`${api.genesisHash.toHex()}-native-balances-${address?.toString()}`);

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [api, address?.toString()] as const,
    queryHash,
    refetchInterval: 12000,
    queryFn: getBalances,
    enabled: isApiReady && !!address
  });

  return [data, isFetched, isFetching];
}

async function getAssetBalances({
  queryKey
}: {
  queryKey: [ApiPromise, allAssets: AssetInfo[], string | undefined | null];
}): Promise<AccountAssetInfo[]> {
  const [api, allAssets, address] = queryKey;

  if (address && allAssets.length > 0 && (api.query.assets || api.query.tokens)) {
    if (api.query.assets) {
      return api
        .queryMulti?.<Option<PalletAssetsAssetAccount>[]>(
          allAssets.map((item) => {
            return isHex(item.assetId)
              ? [api.query.foreignAssets.account, [item.assetId, address.toString()]]
              : [api.query.assets.account, [item.assetId, address.toString()]];
          })
        )
        .then((results) => {
          return results
            .map((result, index) => ({
              ...allAssets[index],
              total: result.isSome ? result.unwrap().balance : BN_ZERO,
              free: result.isSome ? result.unwrap().balance : BN_ZERO,
              locked: BN_ZERO,
              reserved: BN_ZERO,
              transferrable: result.isSome ? result.unwrap().balance : BN_ZERO,
              account: address.toString()
            }))
            .filter((result, index) => result.free.gt(BN_ZERO) || !!allAssets[index].icon);
        });
    }

    if (api.query.tokens) {
      return api
        .queryMulti?.<
          OrmlTokensAccountData[]
        >(allAssets.map((item) => [api.query.tokens.accounts, [address.toString(), item.assetId]]))
        .then((results) => {
          return results
            .map((result, index) => ({
              ...allAssets[index],
              total: result.free.add(result.reserved),
              free: result.free,
              locked: result.frozen,
              reserved: result.reserved,
              transferrable: result.free.add(result.reserved).sub(result.frozen),
              account: address.toString()
            }))
            .filter((result, index) => result.free.add(result.reserved).gt(BN_ZERO) || !!allAssets[index].icon);
        });
    }
  }

  return Promise.resolve([]);
}

export function useAssetBalances(address?: AccountId | AccountId32 | string | null): AccountAssetInfo[] {
  const { api, isApiReady } = useApi();
  const allAssets = useAssets();

  const queryHash = blake2AsHex(
    `${api.genesisHash.toHex()}-${allAssets.map((item) => item.assetId).join('-')}-${address?.toString()}`
  );

  const { data } = useQuery({
    queryKey: [api, allAssets, address?.toString()] as const,
    queryHash,
    refetchInterval: 12000,
    queryFn: getAssetBalances,
    enabled: isApiReady && !!address
  });

  return data ?? [];
}
