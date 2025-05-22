// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { DETECTED_ACCOUNT_KEY } from '@/constants';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { useCallback } from 'react';

import { useLocalStore } from '@mimir-wallet/service';

export function useUnConfirmMultisigs(): [confirm: (addresses: string[]) => void] {
  const [detected, setDetected] = useLocalStore<HexString[]>(DETECTED_ACCOUNT_KEY, []);

  return [
    useCallback(
      (addresses) => {
        const newValue = Array.from(
          new Set([...detected, ...addresses.map((address) => u8aToHex(decodeAddress(address)))])
        );

        setDetected(newValue);
      },
      [detected, setDetected]
    )
  ];
}
