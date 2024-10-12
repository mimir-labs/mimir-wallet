// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KitchensinkRuntimeProxyType } from '@polkadot/types/lookup';
import type { Registry } from '@polkadot/types/types';

import { useMemo } from 'react';

import { registry } from '@mimir-wallet/api';

export function getProxyTypeInstance(registry: Registry, index = 0): KitchensinkRuntimeProxyType {
  // This is not perfect, but should work for `{Kusama, Node, Polkadot}RuntimeProxyType`
  const proxyNames = registry.lookup.names.filter((name) => name.endsWith('RuntimeProxyType'));

  // fallback to previous version (may be Substrate default), when not found
  return registry.createType<KitchensinkRuntimeProxyType>(proxyNames.length ? proxyNames[0] : 'ProxyType', index);
}

export function getProxyOptions(registry: Registry): { text: string; value: number }[] {
  return (
    getProxyTypeInstance(registry)
      .defKeys.map((text, value) => ({ text, value }))
      // Filter the empty entries added in v14
      .filter(({ text }) => !text.startsWith('__Unused'))
  );
}

export function useProxyTypes() {
  return useMemo(() => getProxyOptions(registry), []);
}
