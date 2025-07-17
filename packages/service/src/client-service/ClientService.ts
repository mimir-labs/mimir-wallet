// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountService, AssetService, ChainService, MultisigService, TransactionService } from './services/index.js';

export class ClientService {
  public readonly account: AccountService;
  public readonly asset: AssetService;
  public readonly chain: ChainService;
  public readonly multisig: MultisigService;
  public readonly transaction: TransactionService;

  constructor(private readonly clientGateway: string) {
    this.account = new AccountService(clientGateway);
    this.asset = new AssetService(clientGateway);
    this.chain = new ChainService(clientGateway);
    this.multisig = new MultisigService(clientGateway);
    this.transaction = new TransactionService(clientGateway);
  }

  static create(clientGateway: string) {
    return new ClientService(clientGateway);
  }

  public getClientUrl(path: string) {
    const url = new URL('/v1/' + (path.startsWith('/') ? path.slice(1) : path), this.clientGateway);

    return url.toString();
  }
}
