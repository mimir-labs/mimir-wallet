// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type DappOption, dapps } from '@/config';
import { FAVORITE_DAPP_KEY } from '@/constants';
import { useCallback, useMemo } from 'react';

import { useLocalStore } from '@mimir-wallet/service';

interface UseDapps {
  dapps: DappOption[];
  favorites: DappOption[];
  isFavorite: (id: number) => boolean;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
}

export function useDapp(website?: string | null): DappOption | undefined {
  return useMemo(() => {
    if (website) {
      if (website.startsWith('mimir://')) {
        const app = dapps.find((item) => website.startsWith(item.url));

        return app;
      }

      const websiteURL = new URL(website);
      const app = dapps.find((item) => {
        const appURL = new URL(item.url);

        return websiteURL.hostname === appURL.hostname;
      });

      return app;
    }

    return undefined;
  }, [website]);
}

export function useDapps(): UseDapps {
  const [favoriteIds, setFavoriteIds] = useLocalStore<number[]>(FAVORITE_DAPP_KEY, []);

  const validDapps = useMemo(() => dapps.filter((item) => !item.url.startsWith('mimir://internal')), []);
  const favorites = useMemo(
    () => validDapps.filter((item) => favoriteIds.includes(item.id)),
    [validDapps, favoriteIds]
  );

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
      dapps: validDapps,
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite
    }),
    [addFavorite, favorites, isFavorite, removeFavorite, validDapps]
  );
}
