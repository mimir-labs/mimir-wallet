// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DappOption, dapps, findSupportedDapps } from '@mimir-wallet/config';
import { FAVORITE_DAPP_KEY } from '@mimir-wallet/constants';
import { events } from '@mimir-wallet/events';
import { useCallback, useEffect, useMemo, useState } from 'react';
import store from 'store';

import { useApi } from './useApi';

interface UseDapps {
  dapps: DappOption[];
  favorites: DappOption[];
  isFavorite: (id: number) => boolean;
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
}

export function useDapp(website?: string): DappOption | undefined {
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
  const [favoriteIds, setFavoriteIds] = useState<number[]>(store.get(FAVORITE_DAPP_KEY) || []);

  const dapps = useMemo(() => findSupportedDapps(api), [api]);
  const favorites = useMemo(() => dapps.filter((item) => favoriteIds.includes(item.id)), [dapps, favoriteIds]);

  const addFavorite = useCallback((id: number) => {
    setFavoriteIds((ids) => {
      const values = Array.from([...ids, id]);

      setTimeout(() => {
        store.set(FAVORITE_DAPP_KEY, values);
        events.emit('favorite_dapp_added', id);
      });

      return values;
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavoriteIds((ids) => {
      const values = ids.filter((_id) => _id !== id);

      setTimeout(() => {
        store.set(FAVORITE_DAPP_KEY, values);
        events.emit('favorite_dapp_removed', id);
      });

      return values;
    });
  }, []);

  const isFavorite = useCallback((id: number) => favoriteIds.includes(id), [favoriteIds]);

  useEffect(() => {
    const onChanged = () => {
      setFavoriteIds(store.get(FAVORITE_DAPP_KEY) || []);
    };

    events.on('favorite_dapp_added', onChanged);
    events.on('favorite_dapp_removed', onChanged);

    return () => {
      events.off('favorite_dapp_added', onChanged);
      events.off('favorite_dapp_removed', onChanged);
    };
  }, []);

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
