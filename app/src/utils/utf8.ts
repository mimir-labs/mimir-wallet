// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Data } from '@polkadot/types';

import { u8aToString } from '@polkadot/util';

export function dataToUtf8(data: Data) {
  if (!data) {
    return data;
  }

  return data?.isRaw ? u8aToString(data.asRaw.toU8a(true)) : data?.isNone ? undefined : data?.toHex?.();
}
