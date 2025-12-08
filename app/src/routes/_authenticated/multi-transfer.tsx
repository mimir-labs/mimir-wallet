// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Multi-Transfer Redirect Route (/multi-transfer)
 *
 * Redirects to the multi-transfer explorer app
 */
export const Route = createFileRoute('/_authenticated/multi-transfer')({
  beforeLoad: () => {
    throw redirect({
      to: '/explorer/$url',
      params: { url: 'mimir%3A%2F%2Fapp%2Fmulti-transfer' },
      replace: true,
    });
  },
});
