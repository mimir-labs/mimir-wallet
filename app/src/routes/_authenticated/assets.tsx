// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from '@tanstack/react-router';

import PageAssets from '@/pages/assets';

/**
 * Assets Portfolio Route (/assets)
 *
 * Cross-chain asset portfolio for DOT, parachain tokens, AssetHub assets
 * with XCM transfer support and migration tracking
 */
export const Route = createFileRoute('/_authenticated/assets')({
  component: PageAssets
});
