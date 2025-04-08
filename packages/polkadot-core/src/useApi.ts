// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { ApiContextProps, ValidApiState } from './types.js';

import { useContext } from 'react';

import { ApiContext, SubApiContext } from './context.js';
import { useAllApis } from './useApiStore.js';

export function useApi(): ApiContextProps & {
  allApis: Record<string, ValidApiState>;
  setRootNetwork: (network: string) => void;
} {
  const subValue = useContext(SubApiContext);
  const value = useContext(ApiContext);
  const { chains } = useAllApis();

  const allApis = Object.fromEntries(
    Object.entries(chains).map(([network, { api, ...rest }]) => [network, { ...rest, api: api as ApiPromise }])
  );

  if (subValue) {
    return { ...subValue, setRootNetwork: value.setNetwork, chainSS58: value.chainSS58, allApis };
  }

  return {
    ...value,
    setRootNetwork: value.setNetwork,
    chainSS58: value.chainSS58,
    allApis
  };
}
