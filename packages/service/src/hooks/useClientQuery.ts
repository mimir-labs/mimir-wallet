// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { API_CLIENT_GATEWAY } from '../config.js';

export function useClientQuery(path?: string | null) {
  return {
    queryKey: [
      path !== null && path !== undefined
        ? `${API_CLIENT_GATEWAY}/${path.startsWith('/') ? path.slice(1) : path}`
        : null,
    ],
  } as const;
}
