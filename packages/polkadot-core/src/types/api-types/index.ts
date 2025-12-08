// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideBundleType } from '@polkadot/types/types';

import avail from './avail.json' with { type: 'json' };

export async function getTypesBundle(): Promise<OverrideBundleType> {
  const { typesBundle: typesBundleJs } =
    await import('@polkadot/apps-config/api');

  return {
    ...typesBundleJs,
    spec: {
      ...typesBundleJs.spec,
      avail,
    },
  };
}
