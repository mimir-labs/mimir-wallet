// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';

export function decodeCallSection(registry: Registry, callData: string): [string, string] | undefined {
  if (!callData) return undefined;

  try {
    const call = registry.createType('Call', callData);

    return [call.section, call.method];
  } catch {
    return undefined;
  }
}
