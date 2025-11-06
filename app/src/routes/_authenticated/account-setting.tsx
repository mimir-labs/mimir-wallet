// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Account Settings Redirect Route (/account-setting)
 *
 * Redirects to unified settings page with account tab selected
 */
export const Route = createFileRoute('/_authenticated/account-setting')({
  beforeLoad: () => {
    throw redirect({
      to: '/setting',
      search: { type: 'account' },
      replace: true
    });
  }
});
