// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { ApiPromise } from '@polkadot/api';
import { v4 as uuidv4 } from 'uuid';

import { reduceCalldata } from './reduce';
import { BestTx, CalldataStatus, Transaction } from './types';
import { createTransaction } from './useTransactions';

function insertOrUpdate(
  api: ApiPromise,
  transactionCache: Map<string, Transaction>,
  call: Call,
  sender: HexString,
  status: CalldataStatus,
  blockHeight: number | null,
  extrinsicIndex: number | null
): Transaction {
  const hash = call.hash.toHex();

  let tx = Array.from(transactionCache.values()).find((item) => item.status < CalldataStatus.Success && item.call.hash.toHex() === hash);

  if (tx) {
    tx.status = status;
    tx.height = blockHeight || undefined;
    tx.index = extrinsicIndex || undefined;
  } else {
    tx = createTransaction(
      api,
      {
        uuid: uuidv4(),
        hash: call.hash.toHex(),
        metadata: call.toHex(),
        sender,
        isStart: false,
        isEnd: false,
        status,
        height: blockHeight || undefined,
        index: extrinsicIndex || undefined,
        isValid: true
      },
      false
    );
    transactionCache.set(tx.uuid, tx);
  }

  return tx;
}

async function buildTx(api: ApiPromise, transactionCache: Map<string, Transaction>, tx: BestTx) {
  const apiAt = await api.at(tx.blockHash);
  let childTx: Transaction | null = null;
  let initTransaction: Transaction | null = null;

  const allRecords = await apiAt.query.system.events();
  const events = allRecords
    .filter(({ phase }) => {
      return phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(tx.extrinsicIndex);
    })
    .map(({ event }) => event);

  await reduceCalldata(
    api,
    apiAt,
    api.registry.createType('Call', tx.method),
    tx.extrinsicIndex,
    tx.signer,
    events,
    tx.blockNumber,
    (hash) => {
      const item = Array.from(transactionCache.values()).find((item) => item.call.hash.toHex() === hash);

      if (item) {
        return item.call.toHex();
      } else {
        return null;
      }
    },
    (call, sender, _, __, status, blockHeight, extrinsicIndex) => {
      const tx = insertOrUpdate(api, transactionCache, call, sender, status, blockHeight, extrinsicIndex);

      if (childTx) {
        tx.addChild(childTx);
      }

      if (!initTransaction) {
        initTransaction = tx;
      }

      if (!tx.initTransaction) {
        tx.initTransaction = initTransaction;
      } else {
        if ((tx.initTransaction.height || 0) > (initTransaction.height || 0)) {
          tx.initTransaction = initTransaction;
        }
      }

      childTx = tx;
    }
  );
}

export async function mergeCalldata(api: ApiPromise, transactionCache: Map<string, Transaction>, bestTx: BestTx[]) {
  for (const item of bestTx) {
    await buildTx(api, transactionCache, item);
  }
}
