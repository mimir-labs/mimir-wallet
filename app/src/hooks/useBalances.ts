// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { AccountId, AccountId32 } from '@polkadot/types/interfaces';
import type {
  AcalaPrimitivesCurrencyAssetIds,
  AcalaPrimitivesCurrencyCurrencyId,
  PalletAssetsAssetAccount
} from '@polkadot/types/lookup';
import type { AccountAssetInfo, AccountBalance, AssetInfo, OrmlTokensAccountData, TokenInfo } from './types';

import { findToken } from '@/config';
import { formatUnits } from '@/utils';
import { BN_ZERO, isHex } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';
import { useMemo } from 'react';

import { addressToHex, useApi, type ValidApiState } from '@mimir-wallet/polkadot-core';
import { useQueries, useQuery } from '@mimir-wallet/service';

import { useAssetsByAddress, useAssetsByAddressAll } from './useAssets';
import { useTokenInfo, useTokenInfoAll } from './useTokenInfo';

async function getBalances({ queryKey }: { queryKey: [ApiPromise | null | undefined, string | undefined | null] }) {
  const [api, address] = queryKey;

  if (!api) {
    throw new Error('Api is required');
  }

  if (!address) {
    throw new Error('Address is required');
  }

  return Promise.all([api.query.system.account(address)]).then(([account]) => ({
    total: BigInt(account.data.free.add(account.data.reserved).toString()),
    reserved: BigInt(account.data.reserved.toString()),
    locked: BigInt(account.data.frozen.toString()),
    free: BigInt(account.data.free.toString()),
    transferrable: BigInt(
      account.data.free
        .sub(account.data.frozen.gt(account.data.reserved) ? account.data.frozen.sub(account.data.reserved) : BN_ZERO)
        .toString()
    )
  }));
}

export function useNativeBalances(
  address?: AccountId | AccountId32 | string | null,
  defaultNetwork?: string
): [AccountBalance | undefined, boolean, boolean] {
  const { allApis, network } = useApi();
  const api: ValidApiState | undefined = allApis[defaultNetwork || network];

  const queryHash = blake2AsHex(
    `${api?.genesisHash}-native-balances-${address ? addressToHex(address.toString()) : ''}`
  );

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [api?.api, address?.toString()] as const,
    queryHash,
    refetchInterval: 12_000,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    queryFn: getBalances,
    enabled: !!api && api.isApiReady && !!address
  });

  return [data, isFetched, isFetching];
}

async function _fetchAssetBalances({
  queryKey
}: {
  queryKey: [api: ApiPromise, network: string, assets: AssetInfo[], address: string | undefined | null];
}): Promise<AccountAssetInfo[]> {
  const [api, network, assets, address] = queryKey;

  if (address && assets.length > 0) {
    if (api.query.assets) {
      return Promise.all(
        assets.map(
          (item): Promise<Option<PalletAssetsAssetAccount>> =>
            isHex(item.assetId)
              ? (api.query.foreignAssets.account(item.assetId, address.toString()) as Promise<
                  Option<PalletAssetsAssetAccount>
                >)
              : api.query.assets.account(item.assetId, address.toString())
        )
      ).then((results) => {
        return results
          .map((result, index) => ({
            ...assets[index],
            total: result.isSome ? BigInt(result.unwrap().balance.toString()) : 0n,
            free: result.isSome ? BigInt(result.unwrap().balance.toString()) : 0n,
            locked: 0n,
            reserved: 0n,
            transferrable: result.isSome ? BigInt(result.unwrap().balance.toString()) : 0n,
            account: address.toString()
          }))
          .filter((result) => result.total > 0n);
      });
    }

    if (api.query.tokens) {
      if (network === 'acala' || network === 'karura') {
        return Promise.all(
          assets
            .map((item) => {
              const assetId: AcalaPrimitivesCurrencyAssetIds = api.registry.createType(
                'AcalaPrimitivesCurrencyAssetIds',
                item.assetId
              );

              if (assetId.isErc20) {
                return api.registry.createType('AcalaPrimitivesCurrencyCurrencyId', {
                  Erc20: assetId.asErc20.toHex()
                });
              } else if (assetId.isForeignAssetId) {
                return api.registry.createType('AcalaPrimitivesCurrencyCurrencyId', {
                  ForeignAsset: assetId.asForeignAssetId.toNumber()
                });
              } else if (assetId.isStableAssetId) {
                return api.registry.createType('AcalaPrimitivesCurrencyCurrencyId', {
                  StableAssetPoolToken: assetId.asStableAssetId.toNumber()
                });
              } else if (assetId.isNativeAssetId) {
                const nativeAssetId: AcalaPrimitivesCurrencyCurrencyId = api.registry.createType(
                  'AcalaPrimitivesCurrencyCurrencyId',
                  assetId.asNativeAssetId
                );

                return nativeAssetId;
              } else {
                return null;
              }
            })
            .filter((item) => !!item)
            .map(
              (currencyId) =>
                api.query.tokens.accounts(address.toString(), currencyId) as Promise<OrmlTokensAccountData>
            )
        ).then((results) => {
          return results
            .map((result, index) => ({
              ...assets[index],
              total: BigInt(result.free.add(result.reserved).toString()),
              free: BigInt(result.free.toString()),
              locked: BigInt(result.frozen.toString()),
              reserved: BigInt(result.reserved.toString()),
              transferrable: BigInt(result.free.add(result.reserved).sub(result.frozen).toString()),
              account: address.toString()
            }))
            .filter((result) => result.total > 0n);
        });
      }

      return Promise.all(
        assets.map(
          (item) => api.query.tokens.accounts(address.toString(), item.assetId) as Promise<OrmlTokensAccountData>
        )
      ).then((results) => {
        return results
          .map((result, index) => ({
            ...assets[index],
            total: BigInt(result.free.add(result.reserved).toString()),
            free: BigInt(result.free.toString()),
            locked: BigInt(result.frozen.toString()),
            reserved: BigInt(result.reserved.toString()),
            transferrable: BigInt(result.free.add(result.reserved).sub(result.frozen).toString()),
            account: address.toString()
          }))
          .filter((result) => result.total > 0n);
      });
    }
  }

  return [];
}

export function useAssetBalances(
  network: string,
  address?: AccountId | AccountId32 | string | null
): [data: AccountAssetInfo[], isFetched: boolean, isFetching: boolean] {
  const { allApis } = useApi();
  const api: ValidApiState | undefined = allApis[network];
  const [assets] = useAssetsByAddress(network, address?.toString());
  const [tokenInfo] = useTokenInfo(network);
  const queryHash = useMemo(
    () =>
      blake2AsHex(
        `${network}-${api?.genesisHash}-assets-balances-${address ? addressToHex(address.toString()) : ''}-${
          assets
            ? assets
                .map((item) => item.assetId)
                .sort()
                .join(',')
            : ''
        }-${tokenInfo ? tokenInfo.token.join(',') : ''}`
      ),
    [address, api?.genesisHash, assets, network, tokenInfo]
  );

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [network, api?.api, address, assets, tokenInfo] as const,
    queryHash,
    refetchInterval: 12000,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    enabled: !!address && !!api && api.isApiReady && !!assets,
    queryFn: async ({
      queryKey: [network, api, address, assets, tokenInfo]
    }: {
      queryKey: [
        network: string,
        api: ApiPromise | null | undefined,
        address?: AccountId | AccountId32 | string | null,
        assets?: AssetInfo[],
        tokenInfo?: TokenInfo
      ];
    }): Promise<AccountAssetInfo[]> => {
      if (!api || !address) {
        return [];
      }

      const nativeBalances = await getBalances({ queryKey: [api, address.toString()] });
      const nativeData = {
        network: network,
        name: api.registry.chainTokens[0].toString(),
        symbol: api.registry.chainTokens[0].toString(),
        decimals: api.registry.chainDecimals[0],
        icon: findToken(api.genesisHash.toHex()).Icon,
        isNative: true,
        assetId: 'native',
        total: BigInt(nativeBalances?.total.toString() ?? '0'),
        locked: BigInt(nativeBalances?.locked.toString() ?? '0'),
        reserved: BigInt(nativeBalances?.reserved.toString() ?? '0'),
        transferrable: BigInt(nativeBalances?.transferrable.toString() ?? '0'),
        account: address.toString(),
        price: parseFloat(tokenInfo?.detail?.[api.registry.chainTokens[0].toString()]?.price || '0'),
        change24h: parseFloat(tokenInfo?.detail?.[api.registry.chainTokens[0].toString()]?.price_change || '0')
      } as AccountAssetInfo;

      if (!assets || assets.length === 0) {
        return [nativeData];
      }

      try {
        const data = await _fetchAssetBalances({ queryKey: [api, network, assets, address.toString()] });

        return [
          {
            network: network,
            name: api.runtimeChain.toString(),
            symbol: api.registry.chainTokens[0].toString(),
            decimals: api.registry.chainDecimals[0],
            icon: findToken(api.genesisHash.toHex()).Icon,
            isNative: true,
            assetId: 'native',
            total: BigInt(nativeBalances?.total.toString() ?? '0'),
            locked: BigInt(nativeBalances?.locked.toString() ?? '0'),
            reserved: BigInt(nativeBalances?.reserved.toString() ?? '0'),
            transferrable: BigInt(nativeBalances?.transferrable.toString() ?? '0'),
            account: address.toString(),
            price: parseFloat(tokenInfo?.detail?.[api.registry.chainTokens[0].toString()]?.price || '0'),
            change24h: parseFloat(tokenInfo?.detail?.[api.registry.chainTokens[0].toString()]?.price_change || '0')
          } as AccountAssetInfo,
          ...(data ?? [])
        ];
      } catch (error) {
        console.error(`error when fetching asset balances: ${network}`, error);

        return [nativeData];
      }
    }
  });

  return [data ?? [], isFetched, isFetching];
}

export function useAssetBalancesAll(address?: string) {
  const { allApis } = useApi();
  const [allTokenInfo] = useTokenInfoAll();
  const [allAssets] = useAssetsByAddressAll(address);

  return useQueries({
    queries: Object.entries(allApis).map(([network, api]) => {
      const assets = allAssets?.[network];

      const tokenInfo = allTokenInfo?.[network];
      const queryHash = blake2AsHex(
        `${network}-${api?.genesisHash}-assets-balances-${address ? addressToHex(address.toString()) : ''}-${
          assets
            ? assets
                .map((item) => item.assetId)
                .sort()
                .join(',')
            : ''
        }-${tokenInfo ? tokenInfo.token.join(',') : ''}`
      );

      return {
        queryKey: [network, api.api, address, assets, tokenInfo] as [
          network: string,
          api: ApiPromise,
          address: string | undefined,
          assets: AssetInfo[] | undefined,
          tokenInfo: TokenInfo | undefined
        ],
        queryHash,
        refetchInterval: 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: true,
        enabled: !!address && !!api && api.isApiReady && !!assets,
        queryFn: async ({
          queryKey: [network, api, address, assets, tokenInfo]
        }: {
          queryKey: [
            network: string,
            api: ApiPromise,
            address: string | undefined,
            assets: AssetInfo[] | undefined,
            tokenInfo: TokenInfo | undefined
          ];
        }): Promise<AccountAssetInfo[]> => {
          if (!address) {
            throw new Error('Address is required');
          }

          const nativeBalances = await getBalances({ queryKey: [api, address] });

          const nativeData: AccountAssetInfo = {
            network: network,
            name: api.registry.chainTokens[0].toString(),
            symbol: api.registry.chainTokens[0].toString(),
            decimals: api.registry.chainDecimals[0],
            icon: findToken(api.genesisHash.toHex()).Icon,
            isNative: true,
            assetId: 'native',
            total: nativeBalances?.total ?? 0n,
            locked: nativeBalances?.locked ?? 0n,
            reserved: nativeBalances?.reserved ?? 0n,
            transferrable: nativeBalances?.transferrable ?? 0n,
            account: address.toString(),
            price: parseFloat(tokenInfo?.detail?.[api.registry.chainTokens[0].toString()]?.price || '0'),
            change24h: parseFloat(tokenInfo?.detail?.[api.registry.chainTokens[0].toString()]?.price_change || '0')
          };

          if (!assets || assets.length === 0) {
            return [nativeData];
          }

          try {
            const data = await _fetchAssetBalances({ queryKey: [api, network, assets, address] });

            return [nativeData, ...(data ?? [])];
          } catch (error) {
            console.error('error when fetching asset balances', error);

            return [nativeData];
          }
        }
      };
    })
  });
}

export function useBalanceTotalUsd(address?: string) {
  const assets = useAssetBalancesAll(address);

  return useMemo(() => {
    let lastTotal = 0;
    let total = 0;

    for (const item of assets) {
      if (item.data) {
        for (const asset of item.data) {
          const currentTotal = parseFloat(formatUnits(asset.total, asset.decimals)) * asset.price;

          total += currentTotal;

          lastTotal += currentTotal / (1 + asset.change24h);
        }
      }
    }

    return [total, lastTotal ? (total - lastTotal) / lastTotal : 0];
  }, [assets]);
}
