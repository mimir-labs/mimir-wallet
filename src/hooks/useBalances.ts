// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll, DeriveStakingAccount } from '@polkadot/api-derive/types';
import type { Option } from '@polkadot/types';
import type { AccountId, AccountId32 } from '@polkadot/types/interfaces';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import type { AccountAssetInfo, AccountBalance } from './types';

import { BN_ZERO, isHex } from '@polkadot/util';
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
  const total = filtered.reduce((total, value) => total.iadd(value), BN_ZERO);

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

export function useAssetBalances(address?: AccountId | AccountId32 | string | null): AccountAssetInfo[] {
  const { api } = useApi();
  const [balances, setBalances] = useState<AccountAssetInfo[]>([]);
  const allAssets = useAssets();

  useEffect(() => {
    let unsubPromise: Promise<() => void> | null = null;

    if (address && allAssets.length > 0 && api.query.assets) {
      unsubPromise = api.queryMulti?.<Option<PalletAssetsAssetAccount>[]>(
        allAssets.map((item) => {
          return isHex(item.assetId)
            ? [
                api.query.foreignAssets.account,
                [api.createType('StagingXcmV3MultiLocation', item.assetId), address.toString()]
              ]
            : [api.query.assets.account, [item.assetId, address.toString()]];
        }),
        (results) => {
          setBalances(
            results.map((result, index) => ({
              ...allAssets[index],
              balance: result.unwrapOrDefault().balance,
              account: address.toString()
            }))
          );
        }
      );
    }

    return () => {
      unsubPromise?.then((unsub) => unsub());
    };
  }, [address, allAssets, api]);

  return balances;
}
