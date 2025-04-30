// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideBundleType, RegistryTypes } from '@polkadot/types/types';

import { typesBundleForPolkadot } from '@acala-network/type-definitions';
import { typesBundle as typesBundleJs } from '@polkadot/apps-config/api';

import avail from './avail.json';

export const typesBundle: OverrideBundleType = {
  ...typesBundleJs,
  spec: {
    ...typesBundleJs.spec,
    avail,
    ...typesBundleForPolkadot.spec
  }
};

export const typesChain: Record<string, RegistryTypes> = {
  Crust: {
    DispatchErrorModule: 'DispatchErrorModuleU8'
  }
};
