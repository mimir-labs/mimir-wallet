// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ClientService } from './client-service/ClientService.js';

export * from './config.js';
export * from './client-service/index.js';
export * from './store/index.js';
export * from './hooks/index.js';
export * from './query/index.js';
export { fetcher, type FetchError, type NetworkError } from './fetcher.js';

export let service: ClientService;

export function initService(clientGateway: string) {
  service = ClientService.create(clientGateway);
}
