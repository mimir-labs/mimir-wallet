// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { events } from '@mimirdev/events';

export const API_URL_KEY = 'apiUrl';

// export let apiUrl = 'wss://dev-ws.mimir.global/';
export let apiUrl = process.env.NODE_ENV === 'production' ? 'wss://dev-ws.mimir.global/' : localStorage.getItem(API_URL_KEY) || 'ws://127.0.0.1:9944/';

export function setApiUrl(url: string): void {
  localStorage.setItem(API_URL_KEY, url);
  apiUrl = url;
  events.emit('api_changed', url);
}
