// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OrmlTokensAccountData } from '@/hooks/types';
import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import type { TransferToken } from './types';

import { type BN, BN_ZERO, isHex } from '@polkadot/util';

import { addressToHex, useApi } from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';

async function _getNativeBalance(api: ApiPromise, address: string): Promise<BN> {
  return api.query.system
    .account(address)
    .then((account) =>
      account.data.free
        .add(account.data.reserved)
        .sub(account.data.reserved.gt(account.data.frozen) ? account.data.reserved : account.data.frozen)
    );
}

async function _getAssetBalance(api: ApiPromise, network: string, address: string, assetId: string): Promise<BN> {
  if (api.query.assets) {
    if (isHex(assetId) && !api.query.foreignAssets) {
      return Promise.resolve(BN_ZERO);
    }

    return isHex(assetId)
      ? api.query.foreignAssets.account(assetId, address).then((result) => {
          return (result as Option<PalletAssetsAssetAccount>).unwrapOrDefault().balance;
        })
      : api.query.assets.account(assetId, address).then((result) => {
          return (result as Option<PalletAssetsAssetAccount>).unwrapOrDefault().balance;
        });
  }

  if (api.query.tokens) {
    if (network === 'acala' || network === 'karura') {
      const id: any = api.registry.createType('AcalaPrimitivesCurrencyAssetIds', assetId);
      let currencyId: any | null = null;

      if (id.isErc20) {
        currencyId = api.registry.createType<any>('AcalaPrimitivesCurrencyCurrencyId', {
          Erc20: id.asErc20.toHex()
        });
      } else if (id.isForeignAssetId) {
        currencyId = api.registry.createType<any>('AcalaPrimitivesCurrencyCurrencyId', {
          ForeignAsset: id.asForeignAssetId.toNumber()
        });
      } else if (id.isStableAssetId) {
        currencyId = api.registry.createType<any>('AcalaPrimitivesCurrencyCurrencyId', {
          StableAssetPoolToken: id.asStableAssetId.toNumber()
        });
      } else if (id.isNativeAssetId) {
        const nativeAssetId: any = api.registry.createType<any>(
          'AcalaPrimitivesCurrencyCurrencyId',
          id.asNativeAssetId
        );

        currencyId = nativeAssetId;
      } else {
        currencyId = null;
      }

      if (currencyId) {
        return api.query.tokens.accounts(address, currencyId).then((result) => {
          return (result as unknown as OrmlTokensAccountData).free.sub(
            (result as unknown as OrmlTokensAccountData).frozen
          );
        });
      } else {
        return Promise.resolve(BN_ZERO);
      }
    }

    return api.query.tokens.accounts(address, assetId).then((result) => {
      return (result as unknown as OrmlTokensAccountData).free.sub((result as unknown as OrmlTokensAccountData).frozen);
    });
  }

  return Promise.resolve(BN_ZERO);
}

function _retrieveBalance({
  queryKey: [api, network, address, token]
}: {
  queryKey: [api: ApiPromise, network: string, address?: string, token?: TransferToken];
}): Promise<BN> {
  if (!(address && token)) {
    return Promise.resolve(BN_ZERO);
  }

  if (token?.isNative) {
    return _getNativeBalance(api, address);
  }

  return _getAssetBalance(api, network, address, token.assetId);
}

export function useTransferBalance(
  token?: TransferToken,
  sender?: string
): [format: [decimals: number, symbol: string], sendingBalance: BN, isFetched: boolean, isFetching: boolean] {
  const { api, network, isApiReady } = useApi();
  const { data, isFetching, isFetched } = useQuery({
    queryKey: [api, network, sender, token] as const,
    queryHash: `_retrieveBalance.${network}-${sender ? addressToHex(sender) : ''}-${token?.isNative ? 'native' : token?.assetId}.sender`,
    queryFn: _retrieveBalance,
    refetchInterval: 6000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: isApiReady && !!sender && !!token
  });

  return [token ? [token.decimals, token.symbol] : [0, ''], data ?? BN_ZERO, isFetched, isFetching];
}
