// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from '@mimir-wallet/hooks/types';

import { addressEq } from '@polkadot/util-crypto';
import { useEffect, useState } from 'react';

import { useAddressMeta, useApi } from '@mimir-wallet/hooks';
import { getAddressMeta } from '@mimir-wallet/utils';

function findRelated(transaction: Transaction, values: Transaction[]) {
  const meta = getAddressMeta(transaction.sender);

  if (meta.isFlexible) {
    values.push(...transaction.children[0].cancelChildren);
  } else {
    values.push(...transaction.cancelChildren);
  }
}

export function useRelatedTxs(
  transaction: Transaction
): [relatedTxs: Transaction[], cancelTx: Transaction | undefined] {
  const { api } = useApi();
  const { meta } = useAddressMeta(transaction.sender);
  const [relatedTxs, setRelatedTxs] = useState<Transaction[]>([]);
  const [cancelTx, setCancelTx] = useState<Transaction>();

  useEffect(() => {
    const values: Transaction[] = [];

    findRelated(transaction, values);

    setRelatedTxs(values);
  }, [transaction]);

  useEffect(() => {
    if (!meta?.isMultisig || relatedTxs.length === 0) return;

    api.query.multisig
      .multisigs(
        meta.isFlexible ? transaction.children[0].sender : transaction.sender,
        meta.isFlexible ? transaction.children[0].hash : transaction.hash
      )
      .then((multisigs) => {
        if (multisigs.isSome) {
          setCancelTx(relatedTxs.find((item) => addressEq(item.sender, multisigs.unwrap().depositor.toString())));
        }
      });
  }, [api, meta, relatedTxs, transaction]);

  return [relatedTxs, cancelTx];
}
