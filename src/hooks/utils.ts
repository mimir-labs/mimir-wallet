// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { ApiPromise } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';
import { addressEq } from '@polkadot/util-crypto';
import { v4 as uuidv4 } from 'uuid';

import { reduceCalldata } from './reduce';
import { BestTx, Calldata, CalldataStatus, Transaction } from './types';

export function createTransaction(api: ApiPromise, calldata: Calldata, isFinalized: boolean): Transaction {
  let _action: string | undefined;

  class Instance implements Transaction {
    private api: ApiPromise;

    public isFinalized = isFinalized;

    public parent: Transaction;

    public cancelTx: Transaction | null;

    public children: Transaction[];

    public cancelChildren: Transaction[];

    public uuid: string;

    public hash: HexString;

    public call: Call | null;

    public sender: string;

    public status: CalldataStatus;

    public isValid: boolean;

    public height?: number;

    public index?: number;

    public blockTime: number;

    public website?: string;

    public note?: string;

    public initTransaction!: Transaction;

    constructor(api: ApiPromise) {
      this.api = api;
      this.parent = this;
      this.cancelTx = null;
      this.children = [];
      this.cancelChildren = [];
      this.uuid = calldata.uuid;
      this.hash = calldata.hash;

      try {
        this.call = calldata.metadata ? api.registry.createType('Call', calldata.metadata) : null;
      } catch {
        this.call = null;
      }

      this.sender = keyring.encodeAddress(calldata.sender);
      this.status = calldata.status;
      this.isValid = calldata.isValid;
      this.height = calldata.height;
      this.index = calldata.index;
      this.blockTime = Number(calldata.blockTime || 0);
      this.website = calldata.website;
      this.note = calldata.note;
    }

    private addCancelChild(transaction: Transaction): Transaction {
      const existValue = this.cancelChildren.find((item) => item.uuid === transaction.uuid);

      if (existValue) return existValue;

      this.cancelChildren.push(transaction);
      transaction.cancelTx = this;

      return transaction;
    }

    public addChild(transaction: Transaction): Transaction {
      if (transaction.call && this.api.tx.multisig.cancelAsMulti.is(transaction.call)) {
        return this.addCancelChild(transaction);
      }

      const existValue = this.children.find((item) => item.uuid === transaction.uuid);

      if (existValue) return existValue;

      transaction.parent = this;
      this.children.push(transaction);
      this.children.sort((l, r) => (r.height || 0) - (l.height || 0));

      return transaction;
    }

    public get action(): string {
      if (_action) return _action;

      if (!this.call) return 'unknown';

      if (
        this.api.tx.utility.batchAll.is(this.call) &&
        this.call.args[0].length === 2 &&
        this.api.tx.proxy.addProxy.is(this.call.args[0][0]) &&
        this.api.tx.proxy.removeProxy.is(this.call.args[0][1])
      ) {
        _action = 'ChangeMembers';
      } else {
        _action = `${this.call.section}.${this.call.method}`;
      }

      return _action;
    }

    public get section() {
      return this.call ? this.call.section : 'unknown';
    }

    public get method() {
      return this.call ? this.call.method : 'unknown';
    }

    public get top(): Transaction {
      return this.parent === this ? this : this.parent.top;
    }
  }

  return new Instance(api);
}

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

  let tx = Array.from(transactionCache.values()).find(
    (item) => item.status < CalldataStatus.Success && item.hash === hash
  );

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
        blockTime: Date.now().toString(),
        isValid: true
      },
      false
    );
    transactionCache.set(tx.uuid, tx);
  }

  return tx;
}

function cancelTransaction(
  transactionCache: Map<string, Transaction>,
  hash: HexString,
  sender: string,
  cancelling: string
) {
  const txs = Array.from(transactionCache.values()).filter(
    (item) => item.status === CalldataStatus.Pending && item.hash === hash && addressEq(item.sender, sender)
  );

  for (const item of txs) {
    item.children.forEach((value) => {
      if (addressEq(value.sender, cancelling)) {
        value.status = CalldataStatus.Cancelled;
      }
    });
    reduceCancelTransaction(item);
  }
}

function reduceCancelTransaction(transaction: Transaction) {
  if (transaction.status === CalldataStatus.Initialized) {
    transaction.status = CalldataStatus.Cancelled;
  }

  if (transaction.parent === transaction) {
    return;
  }

  reduceCancelTransaction(transaction.parent);
}

async function buildTx(api: ApiPromise, transactionCache: Map<string, Transaction>, tx: BestTx) {
  const call = api.registry.createType('Call', tx.method);
  const apiAt = await api.at(tx.blockHash);
  let childTx: Transaction | null = null;
  let initTransaction: Transaction | null = null;

  const allRecords = await apiAt.query.system.events();
  const events = allRecords
    .filter(({ phase }) => {
      return phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(tx.extrinsicIndex);
    })
    .map(({ event }) => event);

  if (api.tx.multisig.cancelAsMulti.is(call)) {
    for (const event of events) {
      if (api.events.multisig.MultisigCancelled.is(event)) {
        cancelTransaction(
          transactionCache,
          event.data.callHash.toHex(),
          event.data.multisig.toString(),
          event.data.cancelling.toString()
        );
      }
    }

    return;
  }

  await reduceCalldata(
    api,
    apiAt,
    call,
    tx.extrinsicIndex,
    tx.signer,
    events,
    tx.blockNumber,
    (hash) => {
      const item = Array.from(transactionCache.values()).find((item) => item.hash === hash);

      if (item?.call) {
        return item.call.toHex();
      }

      return null;
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
      } else if ((tx.initTransaction.height || 0) > (initTransaction.height || 0)) {
        tx.initTransaction = initTransaction;
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
