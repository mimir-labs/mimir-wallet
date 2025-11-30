// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { NetworkProvider } from '@mimir-wallet/polkadot-core';

import TxCell from './TxCell';

interface Props {
  withDetails?: boolean;
  defaultOpen?: boolean;
  address: string;
  transaction: Transaction;
}

function TxCellWrapper(props: Props) {
  return (
    <NetworkProvider network={props.transaction.network}>
      <TxCell {...props} />
    </NetworkProvider>
  );
}

export default TxCellWrapper;
