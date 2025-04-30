// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@/hooks/types';

import { SubApiRoot } from '@mimir-wallet/polkadot-core';

import TxCell from './TxCell';

interface Props {
  withDetails?: boolean;
  defaultOpen?: boolean;
  address: string;
  transaction: Transaction;
}

function TxCellWrapper(props: Props) {
  return (
    <SubApiRoot network={props.transaction.network}>
      <TxCell {...props} />
    </SubApiRoot>
  );
}

export default TxCellWrapper;
