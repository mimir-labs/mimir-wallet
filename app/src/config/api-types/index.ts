// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideBundleType, RegistryTypes } from '@polkadot/types/types';

import { typesBundle as typesBundleJs } from '@polkadot/apps-config/api/typesBundle';

import avail from './avail.json';

export const typesBundle: OverrideBundleType = {
  ...typesBundleJs,
  spec: {
    ...typesBundleJs.spec,
    avail
  }
};

export const typesChain: Record<string, RegistryTypes> = {
  Crust: {
    DispatchErrorModule: 'DispatchErrorModuleU8'
  }
};
