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
import type { AccountAssetInfo, AssetInfo, OrmlTokensAccountData } from './types';

import { findToken } from '@/config';
import { formatUnits } from '@/utils';
import { BN_ZERO, isHex } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';
import { isEqual } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

import { addressToHex, useApi, type ValidApiState } from '@mimir-wallet/polkadot-core';
import { useQueries, useQuery } from '@mimir-wallet/service';

import { useAssetInfo, useAssetsByAddress, useAssetsByAddressAll } from './useAssets';
import { useTokenInfo, useTokenInfoAll } from './useTokenInfo';

async function getBalances({
  queryKey
}: {
  queryKey: [api: ApiPromise | null | undefined, address: string | undefined | null, network: string];
}): Promise<AccountAssetInfo<true>> {
  const [api, address, network] = queryKey;

  if (!api) {
    throw new Error('Api is required');
  }

  if (!address) {
    throw new Error('Address is required');
  }

  const symbol = api.registry.chainTokens[0].toString();
  const decimals = api.registry.chainDecimals[0];
  const genesisHash = api.genesisHash.toHex();

  return Promise.all([api.query.system.account(address)]).then(([account]) => ({
    network: network,
    name: symbol,
    symbol: symbol,
    decimals: decimals,
    account: address.toString(),
    icon: findToken(genesisHash).Icon,
    isNative: true,
    assetId: 'native',
    total: BigInt(account.data.free.add(account.data.reserved).toString()),
    reserved: BigInt(account.data.reserved.toString()),
    locked: BigInt(account.data.frozen.toString()),
    free: BigInt(account.data.free.toString()),
    transferrable: BigInt(
      account.data.free
        .sub(account.data.frozen.gt(account.data.reserved) ? account.data.frozen.sub(account.data.reserved) : BN_ZERO)
        .toString()
    ),
    price: 0,
    change24h: 0
  }));
}

export function useNativeBalances(
  address?: AccountId | AccountId32 | string | null
): [AccountAssetInfo<true> | undefined, boolean, boolean] {
  const { api, isApiReady, network } = useApi();
  const [tokenInfo] = useTokenInfo(network);

  const addressHex = address ? addressToHex(address.toString()) : '';
  const queryHash = useMemo(() => blake2AsHex(`${network}-native-balances-${addressHex}`), [network, addressHex]);

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [api, address?.toString(), network] as const,
    queryHash,
    queryFn: getBalances,
    enabled: !!api && isApiReady && !!address,
    staleTime: 12_000,
    refetchInterval: 12_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    structuralSharing: (prev, next) => {
      return isEqual(prev, next) ? prev : next;
    }
  });

  return [
    useMemo(() => {
      if (!data) {
        return undefined;
      }

      return {
        ...data,
        price: parseFloat(tokenInfo?.detail?.[data.symbol]?.price || '0'),
        change24h: parseFloat(tokenInfo?.detail?.[data.symbol]?.price_change || '0')
      };
    }, [data, tokenInfo]),
    isFetched,
    isFetching
  ];
}

type UseNativeBalancesAll = {
  data: AccountAssetInfo<true> | undefined;
  isFetched: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
};

export function useNativeBalancesAll(address?: string): UseNativeBalancesAll[] {
  const { allApis } = useApi();
  const [allTokenInfo] = useTokenInfoAll();
  const addressHex = address ? addressToHex(address.toString()) : '';
  const [list, setList] = useState<UseNativeBalancesAll[]>([]);

  const queries = useQueries({
    queries: Object.entries(allApis).map(([network, api]) => {
      const queryHash = blake2AsHex(`${network}-native-balances-${addressHex}`);

      return {
        queryKey: [api.api, address?.toString(), network] as [
          api: ApiPromise,
          address: string | undefined,
          network: string
        ],
        queryHash,
        refetchInterval: 12_000,
        refetchOnMount: false,
        refetchOnWindowFocus: true,
        enabled: !!address && !!api && api.isApiReady,
        queryFn: getBalances
      };
    })
  });

  useEffect(() => {
    setList((prev) => {
      const newValue = queries.map((item) => {
        const data = item.data;

        const tokenInfo = data ? allTokenInfo?.[data.network] : undefined;

        return {
          isFetched: item.isFetched,
          isFetching: item.isFetching,
          isError: item.isError,
          refetch: item.refetch,
          data: data
            ? ({
                ...data,
                price: parseFloat(tokenInfo?.detail?.[data.symbol]?.price || '0'),
                change24h: parseFloat(tokenInfo?.detail?.[data.symbol]?.price_change || '0')
              } as AccountAssetInfo<true>)
            : undefined
        };
      });

      return isEqual(prev, newValue) ? prev : newValue;
    });
  }, [allTokenInfo, queries]);

  return list;
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
          (item): Promise<Option<PalletAssetsAssetAccount> | undefined | null> =>
            isHex(item.assetId)
              ? (api.query.foreignAssets?.account?.(item.assetId, address.toString()) as Promise<
                  Option<PalletAssetsAssetAccount> | undefined | null
                >)
              : api.query.assets.account(item.assetId, address.toString())
        )
      ).then((results) => {
        return results
          .filter((item) => !!item)
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

async function _fetchAssetBalance({
  queryKey
}: {
  queryKey: [api: ApiPromise, network: string, asset: AssetInfo<false> | undefined, address: string | undefined | null];
}): Promise<AccountAssetInfo<false>> {
  const [api, network, asset, address] = queryKey;

  if (!address || !asset) {
    throw new Error('Address and asset are required');
  }

  if (api.query.assets) {
    return (
      isHex(asset.assetId)
        ? (api.query.foreignAssets?.account?.(asset.assetId, address.toString()) as Promise<
            Option<PalletAssetsAssetAccount> | undefined | null
          >)
        : api.query.assets.account(asset.assetId, address.toString())
    ).then((result) => {
      return {
        ...asset,
        total: result?.isSome ? BigInt(result.unwrap().balance.toString()) : 0n,
        free: result?.isSome ? BigInt(result.unwrap().balance.toString()) : 0n,
        locked: 0n,
        reserved: 0n,
        transferrable: result?.isSome ? BigInt(result.unwrap().balance.toString()) : 0n,
        account: address.toString()
      };
    });
  }

  if (api.query.tokens) {
    if (network === 'acala' || network === 'karura') {
      const assetId: AcalaPrimitivesCurrencyAssetIds = api.registry.createType(
        'AcalaPrimitivesCurrencyAssetIds',
        asset.assetId
      );

      let currencyId: AcalaPrimitivesCurrencyCurrencyId;

      if (assetId.isErc20) {
        currencyId = api.registry.createType('AcalaPrimitivesCurrencyCurrencyId', {
          Erc20: assetId.asErc20.toHex()
        });
      } else if (assetId.isForeignAssetId) {
        currencyId = api.registry.createType('AcalaPrimitivesCurrencyCurrencyId', {
          ForeignAsset: assetId.asForeignAssetId.toNumber()
        });
      } else if (assetId.isStableAssetId) {
        currencyId = api.registry.createType('AcalaPrimitivesCurrencyCurrencyId', {
          StableAssetPoolToken: assetId.asStableAssetId.toNumber()
        });
      } else if (assetId.isNativeAssetId) {
        currencyId = api.registry.createType('AcalaPrimitivesCurrencyCurrencyId', assetId.asNativeAssetId);
      } else {
        throw new Error('Invalid asset id');
      }

      return (api.query.tokens.accounts(address.toString(), currencyId) as Promise<OrmlTokensAccountData>).then(
        (result) => {
          return {
            ...asset,
            total: BigInt(result.free.add(result.reserved).toString()),
            free: BigInt(result.free.toString()),
            locked: BigInt(result.frozen.toString()),
            reserved: BigInt(result.reserved.toString()),
            transferrable: BigInt(result.free.add(result.reserved).sub(result.frozen).toString()),
            account: address.toString()
          };
        }
      );
    }

    return (api.query.tokens.accounts(address.toString(), asset.assetId) as Promise<OrmlTokensAccountData>).then(
      (result) => {
        return {
          ...asset,
          total: BigInt(result.free.add(result.reserved).toString()),
          free: BigInt(result.free.toString()),
          locked: BigInt(result.frozen.toString()),
          reserved: BigInt(result.reserved.toString()),
          transferrable: BigInt(result.free.add(result.reserved).sub(result.frozen).toString()),
          account: address.toString()
        };
      }
    );
  }

  throw new Error('Invalid network');
}

export function useAssetBalances(
  network: string,
  address?: AccountId | AccountId32 | string | null
): [data: AccountAssetInfo[], isFetched: boolean, isFetching: boolean] {
  const { allApis } = useApi();
  const api: ValidApiState | undefined = allApis[network];
  const [assets] = useAssetsByAddress(network, address?.toString());
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);
  const queryHash = useMemo(
    () =>
      blake2AsHex(
        `${network}-assets-balances-${addressHex}-${assets
          ?.map((item) => item.assetId)
          .sort()
          .join(',')}`
      ),
    [addressHex, assets, network]
  );

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [network, api?.api, address, assets] as const,
    queryHash,
    staleTime: 12_000,
    refetchInterval: 12_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!address && !!api && api.isApiReady && !!assets,
    queryFn: async ({
      queryKey: [network, api, address, assets]
    }: {
      queryKey: [
        network: string,
        api: ApiPromise | null | undefined,
        address?: AccountId | AccountId32 | string | null,
        assets?: AssetInfo[]
      ];
    }): Promise<AccountAssetInfo[]> => {
      if (!api || !assets || !address) {
        throw new Error('Api, assets and address are required');
      }

      const data = await _fetchAssetBalances({ queryKey: [api, network, assets, address.toString()] });

      return data;
    }
  });

  return [useMemo(() => data || [], [data]), isFetched, isFetching];
}

export function useAssetBalance(
  network: string,
  address?: AccountId | AccountId32 | string | null,
  assetId?: string | null
): [data: AccountAssetInfo<false> | undefined, isFetched: boolean, isFetching: boolean] {
  const { allApis } = useApi();
  const api: ValidApiState | undefined = allApis[network];

  const [assetInfo] = useAssetInfo(network, assetId);
  const addressHex = address ? addressToHex(address.toString()) : '';
  const queryHash = `${network}-asset-balance-${addressHex}-${assetInfo?.assetId}`;

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [api?.api, network, assetInfo, addressHex] as const,
    queryHash,
    queryFn: _fetchAssetBalance,
    staleTime: 12_000,
    refetchInterval: 12_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!api && !!api.isApiReady && !!api.api && !!assetInfo && !!addressHex
  });

  return [data, isFetched, isFetching];
}

type UseAssetBalancesAll = {
  data: AccountAssetInfo[] | undefined;
  isFetched: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
};

export function useAssetBalancesAll(address?: string): UseAssetBalancesAll[] {
  const { allApis } = useApi();
  const [allAssets] = useAssetsByAddressAll(address);
  const addressHex = useMemo(() => (address ? addressToHex(address.toString()) : ''), [address]);
  const [list, setList] = useState<UseAssetBalancesAll[]>([]);

  const queries = useQueries({
    queries: Object.entries(allApis).map(([network, api]) => {
      const assets = allAssets?.[network];

      const queryHash = blake2AsHex(
        `${network}-assets-balances-${addressHex}-${assets
          ?.map((item) => item.assetId)
          .sort()
          .join(',')}`
      );

      return {
        queryKey: [network, api.api, address, assets] as [
          network: string,
          api: ApiPromise,
          address: string | undefined,
          assets: AssetInfo[] | undefined
        ],
        queryHash,
        staleTime: 12_000,
        refetchInterval: 12_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!address && !!api && !!api.isApiReady && !!assets,
        queryFn: async ({
          queryKey: [network, api, address, assets]
        }: {
          queryKey: [network: string, api: ApiPromise, address: string | undefined, assets: AssetInfo[] | undefined];
        }): Promise<AccountAssetInfo[]> => {
          if (!address || !assets) {
            throw new Error('Address and assets are required');
          }

          const data = await _fetchAssetBalances({ queryKey: [api, network, assets, address] });

          return data;
        }
      };
    })
  });

  useEffect(() => {
    setList((prev) => {
      const newValue = queries.map((item) => {
        const data = item.data;

        return {
          isFetched: item.isFetched,
          isFetching: item.isFetching,
          isError: item.isError,
          refetch: item.refetch,
          data: data
        };
      });

      return isEqual(prev, newValue) ? prev : newValue;
    });
  }, [queries]);

  return list;
}

export function useBalanceTotalUsd(address?: string) {
  const nativeBalances = useNativeBalancesAll(address);
  const assets = useAssetBalancesAll(address);
  const [total, setTotal] = useState(0);
  const [changes, setChanges] = useState(0);

  useEffect(() => {
    let lastTotal = 0;
    let total = 0;

    for (const item of assets) {
      if (item.data) {
        for (const asset of item.data) {
          const currentTotal = parseFloat(formatUnits(asset.total, asset.decimals)) * (asset.price || 0);

          total += currentTotal;

          lastTotal += currentTotal / (1 + (asset.change24h || 0));
        }
      }
    }

    for (const item of nativeBalances) {
      if (item.data) {
        const currentTotal = parseFloat(formatUnits(item.data.total, item.data.decimals)) * (item.data.price || 0);

        total += currentTotal;

        lastTotal += currentTotal / (1 + (item.data.change24h || 0));
      }
    }

    setTotal(total);
    setChanges(lastTotal ? (total - lastTotal) / lastTotal : 0);
  }, [assets, nativeBalances]);

  return [total, changes];
}
