// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  AccountService,
  ApiVersion,
  AssetService,
  BaseServiceOptions,
  ChainService,
  EmailNotificationService,
  MultisigService,
  TransactionService,
  WebPushService
} from './services/index.js';

export type ClientServiceOptions = BaseServiceOptions;

export class ClientService {
  public readonly account: AccountService;
  public readonly asset: AssetService;
  public readonly chain: ChainService;
  public readonly emailNotification: EmailNotificationService;
  public readonly multisig: MultisigService;
  public readonly transaction: TransactionService;
  public readonly webPush: WebPushService;
  private readonly version: ApiVersion;

  constructor(
    private readonly clientGateway: string,
    options: ClientServiceOptions = {}
  ) {
    this.version = options.version || 'v1';

    this.account = new AccountService(clientGateway, options);
    this.asset = new AssetService(clientGateway, options);
    this.chain = new ChainService(clientGateway, options);
    this.emailNotification = new EmailNotificationService(clientGateway, options);
    this.multisig = new MultisigService(clientGateway, options);
    this.transaction = new TransactionService(clientGateway, options);
    this.webPush = new WebPushService(clientGateway, options);
  }

  static create(clientGateway: string, options?: ClientServiceOptions) {
    return new ClientService(clientGateway, options);
  }

  public getClientUrl(path: string, version?: ApiVersion) {
    const apiVersion = version || this.version;
    const url = new URL(`/${apiVersion}/` + (path.startsWith('/') ? path.slice(1) : path), this.clientGateway);

    return url.toString();
  }
}
