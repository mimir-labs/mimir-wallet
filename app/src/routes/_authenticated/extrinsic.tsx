// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Extrinsic Redirect Route (/extrinsic)
 *
 * Redirects to the submit-calldata explorer app.
 * Submit raw extrinsic calldata or recover transactions from other tools
 * (PolkadotJS approveAsMulti)
 */
export const Route = createFileRoute('/_authenticated/extrinsic')({
  beforeLoad: () => {
    throw redirect({
      to: '/explorer/$url',
      params: { url: 'mimir://app/submit-calldata' },
      replace: true
    });
  }
});
