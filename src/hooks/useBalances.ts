// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll, DeriveStakingAccount } from '@polkadot/api-derive/types';
import type { Option } from '@polkadot/types';
import type { AccountId, AccountId32 } from '@polkadot/types/interfaces';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import type { AccountAssetInfo, AccountBalance, AssetInfo, OrmlTokensAccountData } from './types';

import { BN_ZERO, isHex } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useApi } from './useApi';
import { useAssets } from './useAssets';
import { useCall } from './useCall';

function calcUnbonding(stakingInfo?: DeriveStakingAccount) {
  if (!stakingInfo?.unlocking) {
    return BN_ZERO;
  }

  const filtered = stakingInfo.unlocking
    .filter(({ remainingEras, value }) => value.gt(BN_ZERO) && remainingEras.gt(BN_ZERO))
    .map((unlock) => unlock.value);
  const total = filtered.reduce((total, value) => total.add(value), BN_ZERO);

  return total;
}

export function useNativeBalances(address?: AccountId | AccountId32 | string | null): AccountBalance | undefined {
  const { api } = useApi();
  const [balances, setBalances] = useState<AccountBalance>();
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances?.all, address ? [address] : []);
  const stakingInfo = useCall<DeriveStakingAccount>(api.derive.staking?.account, address ? [address] : []);

  useEffect(() => {
    if (balancesAll) {
      setBalances({
        // some chains don't have "active" in the Ledger
        bonded: stakingInfo?.stakingLedger.active?.unwrap() || BN_ZERO,
        reserved: balancesAll.reservedBalance,
        locked: balancesAll.lockedBalance,
        redeemable: stakingInfo?.redeemable || BN_ZERO,
        total: balancesAll.freeBalance.add(balancesAll.reservedBalance),
        transferrable: balancesAll.availableBalance,
        unbonding: calcUnbonding(stakingInfo)
      });
    }
  }, [balancesAll, stakingInfo]);

  return balances;
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
    } else if (api.query.tokens) {
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
              transferrable: result.free.sub(result.frozen),
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
    enabled: isApiReady
  });

  return data ?? [];
}
