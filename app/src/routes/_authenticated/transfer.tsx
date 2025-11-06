// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Transfer Redirect Route (/transfer)
 *
 * Redirects to the transfer explorer app
 */
export const Route = createFileRoute('/_authenticated/transfer')({
  beforeLoad: () => {
    throw redirect({
      to: '/explorer/$url',
      params: { url: 'mimir%3A%2F%2Fapp%2Ftransfer' },
      replace: true
    });
  }
});
