// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

const isDevEnv =
  import.meta.env.DEV ||
  window.location.hostname.startsWith('dev.mimir.global') ||
  window.location.hostname.startsWith('localhost');

export const API_CLIENT_GATEWAY = isDevEnv
  ? 'https://mimir-client.mimir.global/v1'
  : 'https://mimir-client.mimir.global/v1';

export const API_CLIENT_WS_GATEWAY = isDevEnv ? 'wss://mimir-client.mimir.global' : 'wss://mimir-client.mimir.global';
