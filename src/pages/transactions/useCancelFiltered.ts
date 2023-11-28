// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Filtered } from '@mimirdev/hooks/ctx/types';

import { addressEq } from '@polkadot/util-crypto';
import { useEffect, useState } from 'react';

import { useAddressMeta } from '@mimirdev/hooks';
import { CalldataStatus, type Transaction } from '@mimirdev/hooks/types';
import { getAddressMeta } from '@mimirdev/utils';

import { checkFiltered, extraFiltered } from './util';

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
    const filtered = extraFiltered(transaction.sender);

    extraCancelFiltered(api, transaction, filtered).then(() => {
      setFiltered(filtered);
      setCanCancel(checkFiltered(filtered));
    });
  }, [api, meta, transaction]);

  return [filtered, canCancel];
}
