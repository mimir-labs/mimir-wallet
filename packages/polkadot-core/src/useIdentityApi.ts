// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { ApiContext } from './context.js';
import { useAllApis } from './useApiStore.js';

export function useIdentityApi() {
  const { chain } = useContext(ApiContext);
  const { chains } = useAllApis();

  return chain.identityNetwork ? chains[chain.identityNetwork] : null;
}
