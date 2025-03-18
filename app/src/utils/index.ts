// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ClientService } from '@mimir-wallet/service';

export * from './common';
export * from './utf8';
export * from './check';
export * from './time';
export * from './units';
export * from './url';
export * from './document';

export let service: ClientService;

export function initService(clientGateway: string, networkService: string) {
  service = ClientService.create(clientGateway, networkService);
}
