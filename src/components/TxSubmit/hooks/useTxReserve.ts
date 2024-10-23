// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { TxBundle } from '../utils';

import { useEffect, useState } from 'react';

import { extrinsicReserve } from '@mimir-wallet/api';
import { useApi } from '@mimir-wallet/hooks';

const EMPTY_STATE = {
  isLoading: true,
  reserve: {},
  unreserve: {},
  delay: {}
};

export type TxReserve = {
  isLoading: boolean;
  reserve: Record<string, { value: BN; type: 'multisig' | 'proxy' }>;
  unreserve: Record<string, { value: BN; type: 'multisig' | 'proxy' }>;
  delay: Record<string, BN>;
};

export function useTxReserve(txBundle?: TxBundle | null) {
  const { api } = useApi();
  const { tx, signer } = txBundle || {};
  const [state, setState] = useState<TxReserve>(EMPTY_STATE);

  useEffect(() => {
    setState(EMPTY_STATE);

    if (signer && tx) {
      extrinsicReserve(api, signer, tx)
        .then(({ reserve, unreserve, delay }) => {
          setState({ isLoading: false, reserve, unreserve, delay });
        })
        .catch(() => setState({ ...EMPTY_STATE, isLoading: false }));
    }
  }, [api, signer, tx]);

  return state;
}
