// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { API_CLIENT_GATEWAY } from '../config.js';

export function useClientQuery(path?: string | null) {
  return {
    queryHash: `${API_CLIENT_GATEWAY}/${path}`,
    queryKey: [
      path !== null && path !== undefined
        ? `${API_CLIENT_GATEWAY}/${path.startsWith('/') ? path.slice(1) : path}`
        : null
    ]
  } as const;
}
