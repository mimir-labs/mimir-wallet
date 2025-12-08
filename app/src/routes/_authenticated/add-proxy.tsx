// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import { createFileRoute } from '@tanstack/react-router';

/**
 * Add Proxy Route (/add-proxy)
 *
 * Add proxy account for delegation with specific permissions
 * (Any/NonTransfer/Staking/Governance/IdentityJudgement)
 */
export const Route = createFileRoute('/_authenticated/add-proxy')({
  staticData: {
    title: 'Add Proxy',
  } as RouteMetadata,
});
