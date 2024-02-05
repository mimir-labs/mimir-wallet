// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';
import type { ApiPromise } from '@polkadot/api';

import { useAddressMeta } from '@mimir-wallet/hooks';
import { CalldataStatus, type Transaction } from '@mimir-wallet/hooks/types';
import { getAddressMeta } from '@mimir-wallet/utils';
import { addressEq } from '@polkadot/util-crypto';
import { useEffect, useState } from 'react';

import { checkFiltered, extraFiltered, removeEmptyMultisigFiltered } from '../util';

async function extraCancelFiltered(api: ApiPromise, transaction: Transaction, filtered: Filtered): Promise<void> {
  const meta = getAddressMeta(transaction.sender);

  const tx: Transaction | undefined = meta.isFlexible ? transaction.children[0] : transaction;

  if (!tx) {
    return;
  }

  // remove the address not in children
  Object.keys(filtered).forEach((address) => {
    if (!tx.children.find((item) => addressEq(item.sender, address))) {
      delete filtered[address];
    }
  });

  if (tx.status === CalldataStatus.Initialized) {
    for (const item of tx.children) {
      const _filtered = filtered[item.sender];

      if (_filtered) {
        await extraCancelFiltered(api, item, _filtered);
      }
    }
  } else if (tx.status === CalldataStatus.Pending) {
    const info = await api.query.multisig.multisigs(tx.sender, tx.call.hash);

    Object.keys(filtered).forEach((address) => {
      if (info.isSome) {
        if (!addressEq(address, info.unwrap().depositor.toString())) {
          delete filtered[address];
        }
      }
    });
  }
}

export function useCancelFiltered(api: ApiPromise, transaction: Transaction): [filtered: Filtered | undefined, canCancel: boolean] {
  const { meta } = useAddressMeta(transaction.sender);
  const [filtered, setFiltered] = useState<Filtered>();
  const [canCancel, setCanCancel] = useState<boolean>(false);

  useEffect(() => {
    if (transaction.status > CalldataStatus.Pending) {
      setFiltered(undefined);
      setCanCancel(false);

      return;
    }

    const filtered = extraFiltered(transaction.sender);

    extraCancelFiltered(api, transaction, filtered).then(() => {
      removeEmptyMultisigFiltered(filtered);
      setFiltered(filtered);
      setCanCancel(checkFiltered(filtered));
    });
  }, [api, meta, transaction]);

  return [filtered, canCancel];
}
