// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import PageAnalytic from '@/pages/analytic';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Analytics Dashboard Route (/analytic)
 *
 * Multisig analytics dashboard showing common extrinsics, recipient patterns,
 * transaction volume, and signer activity
 */
export const Route = createFileRoute('/_authenticated/analytic')({
  component: PageAnalytic
});
