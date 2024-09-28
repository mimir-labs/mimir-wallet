// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from 'react';

import { DappOption, dapps, findSupportedDapps } from '@mimir-wallet/config';
import { FAVORITE_DAPP_KEY } from '@mimir-wallet/constants';

import { useApi } from './useApi';
import { useLocalStore } from './useStore';

interface UseDapps {
  dapps: DappOption[];
  favorites: DappOption[];
  isFavorite: (id: number) => boolean;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
}

export function useDapp(website?: string | null): DappOption | undefined {
  return useMemo(() => {
    if (!website) return undefined;

    return dapps.find((item) => {
      if (item.internal) return false;

      const urlIn = new URL(website);
      const urlThis = new URL(item.url);

      return urlIn.origin === urlThis.origin;
    });
  }, [website]);
}

export function useDapps(): UseDapps {
  const { api } = useApi();
  const [favoriteIds, setFavoriteIds] = useLocalStore<number[]>(FAVORITE_DAPP_KEY, []);

  const dapps = useMemo(() => findSupportedDapps(api), [api]);
  const favorites = useMemo(() => dapps.filter((item) => favoriteIds.includes(item.id)), [dapps, favoriteIds]);

  const addFavorite = useCallback(
    (id: number) => {
      setFavoriteIds((ids) => Array.from([...ids, id]));
    },
    [setFavoriteIds]
  );

  const removeFavorite = useCallback(
    (id: number) => {
      setFavoriteIds((ids) => ids.filter((_id) => _id !== id));
    },
    [setFavoriteIds]
  );

  const isFavorite = useCallback((id: number) => favoriteIds.includes(id), [favoriteIds]);

  return useMemo(
    () => ({
      dapps,
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite
    }),
    [addFavorite, dapps, favorites, isFavorite, removeFavorite]
  );
}
