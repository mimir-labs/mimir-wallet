// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountId, Address } from '@polkadot/types/interfaces';

import React, { useState } from 'react';

interface Props {
  children?: React.ReactNode;
}

export interface Tx {
  accountId: AccountId | Address | string;
  extrinsic: SubmittableExtrinsic<'promise'>;
  isMultisig: boolean;
  isMultisigCancel: boolean;
}

export interface TxState {
  tx?: Tx;
  setTx: (tx?: Tx) => void;
}

export const TxCtx = React.createContext<TxState>({} as TxState);

export function TxCtxRoot({ children }: Props): React.ReactElement<Props> {
  const [tx, setTx] = useState<Tx>();

  return <TxCtx.Provider value={{ tx, setTx }}>{children}</TxCtx.Provider>;
}
