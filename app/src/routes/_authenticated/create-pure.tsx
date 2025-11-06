// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import PageAddProxy from '@/pages/add-proxy';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Create Pure Proxy Route (/create-pure)
 *
 * Create keyless pure proxy account for automation, validator setups,
 * and enhanced security isolation
 */
export const Route = createFileRoute('/_authenticated/create-pure')({
  staticData: {
    title: 'Create Pure'
  } as RouteMetadata,
  component: () => <PageAddProxy pure={true} />
});
