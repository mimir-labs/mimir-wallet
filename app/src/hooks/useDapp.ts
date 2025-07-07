// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { type CustomDappOption, type DappOption, dapps } from '@/config';
import { CUSTOM_APP_KEY, FAVORITE_DAPP_KEY } from '@/constants';
import { isSameTopDomain } from '@/utils';
import { useCallback, useMemo } from 'react';

import { useLocalStore } from '@mimir-wallet/service';

interface UseDapps {
  dapps: DappOption[];
  customApps: CustomDappOption[];
  isFavorite: (id: number | string) => boolean;
  addFavorite: (id: number | string) => void;
  removeFavorite: (id: number | string) => void;
  addCustom: (app: CustomDappOption) => void;
  removeCustom: (id: string | number) => void;
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

        return websiteURL.hostname === appURL.hostname || isSameTopDomain(website, item.url);
      });

      return app;
    }

    return undefined;
  }, [website]);
}

export function useDapps(): UseDapps {
  const [favoriteIds, setFavoriteIds] = useLocalStore<(number | string)[]>(FAVORITE_DAPP_KEY, []);
  const [customApps, setCustomApps] = useLocalStore<CustomDappOption[]>(CUSTOM_APP_KEY, []);

  const addCustom = useCallback(
    (app: CustomDappOption) => {
      setCustomApps((v) => {
        if (v.some((item) => item.id === app.id)) {
          return v;
        } else {
          return [...v, app];
        }
      });
    },
    [setCustomApps]
  );

  const removeCustom = useCallback(
    (id: string | number) => {
      setCustomApps((v) => {
        return v.filter((item) => item.id !== id);
      });
    },
    [setCustomApps]
  );

  const validDapps = useMemo(
    () =>
      dapps
        .filter((item) => !item.url.startsWith('mimir://internal'))
        .sort((a, b) => favoriteIds.indexOf(b.id) - favoriteIds.indexOf(a.id)),
    [favoriteIds]
  );

  const addFavorite = useCallback(
    (id: number | string) => {
      setFavoriteIds((ids) => Array.from([...ids, id]));
    },
    [setFavoriteIds]
  );

  const removeFavorite = useCallback(
    (id: number | string) => {
      setFavoriteIds((ids) => ids.filter((_id) => _id !== id));
    },
    [setFavoriteIds]
  );

  const isFavorite = useCallback((id: number | string) => favoriteIds.includes(id), [favoriteIds]);

  return useMemo(
    () => ({
      dapps: validDapps,
      customApps,
      addFavorite,
      removeFavorite,
      isFavorite,
      addCustom,
      removeCustom
    }),
    [addCustom, addFavorite, customApps, isFavorite, removeCustom, removeFavorite, validDapps]
  );
}
