// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '../types.js';

import { BaseService } from './BaseService.js';

export class TransactionService extends BaseService {
  public submitPropose(
    network: string,
    address: string,
    call: HexString,
    signer: string,
    signature: string,
    time: string,
    appName?: string,
    iconUrl?: string,
    note?: string,
    website?: string
  ) {
    return this.post(`chains/${network}/${address}/transactions/propose`, {
      call,
      signer,
      signature,
      time,
      appName,
      iconUrl,
      note,
      website
    });
  }

  public removePropose(network: string, proposeId: number, signer: string, signature: string, time: string) {
    return this.put(`chains/${network}/transactions/propose/${proposeId}/remove`, { signer, signature, time });
  }

  public getPendingTransactions(chain: string, address: string, txId?: string) {
    const path = `chains/${chain}/${address}/transactions/pending`;

    return this.get(path, txId ? { tx_id: txId } : undefined);
  }

  public getTransactionDetail(chain: string, id: string) {
    return this.get(`chains/${chain}/transactions/details/${id}`);
  }

  public getTransactionCounts(addressHex: string) {
    return this.get(`transactions/counts/${addressHex}`);
  }

  public getBatchTransactions(chain: string, addressHex: string) {
    return this.get(`chains/${chain}/${addressHex}/transactions/batch`);
  }

  public removeBatch(
    chain: string,
    address: string,
    ids: number[],
    signature: string,
    signer: string,
    timestamp: string | number
  ) {
    return this.post(`chains/${chain}/${address}/transactions/batch/remove`, { ids, signature, signer, timestamp });
  }

  public uploadWebsite(
    network: string,
    extrinsicHash: HexString,
    website?: string | null,
    appName?: string | null,
    iconUrl?: string | null,
    note?: string | null,
    relatedBatches?: number[]
  ): Promise<boolean> {
    return this.post(`chains/${network}/website`, {
      extrinsicHash,
      website,
      appName,
      iconUrl,
      note,
      relatedBatches
    });
  }

  public getHistoryTransactions(chain: string, address: string, txId?: string, nextCursor?: string, limit?: number) {
    const path = `chains/${chain}/${address}/transactions/history`;
    const params: Record<string, string> = {};

    if (txId) params.tx_id = txId;
    if (limit) params.limit = limit.toString();
    if (nextCursor) params.next_cursor = nextCursor;

    return this.get(path, Object.keys(params).length > 0 ? params : undefined);
  }

  public getHistoryTransactionsV2(chain: string, address: string, txId?: string, nextCursor?: string, limit?: number) {
    const path = `chains/${chain}/${address}/transactions/history`;
    const params: Record<string, string> = {};

    if (txId) params.tx_id = txId;
    if (limit) params.limit = limit.toString();
    if (nextCursor) params.next_cursor = nextCursor;

    return this.get(path, Object.keys(params).length > 0 ? params : undefined, 'v2');
  }
}
