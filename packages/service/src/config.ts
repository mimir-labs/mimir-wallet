// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const API_CLIENT_GATEWAY: string =
  import.meta.env.VITE_API_CLIENT_GATEWAY || 'https://mimir-client.mimir.global/v1';

export const API_CLIENT_WS_GATEWAY: string =
  import.meta.env.VITE_API_CLIENT_WS_GATEWAY || 'wss://mimir-client.mimir.global';
