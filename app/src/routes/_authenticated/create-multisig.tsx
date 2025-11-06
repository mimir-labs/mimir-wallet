// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import PageCreateMultisig from '@/pages/create-multisig';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Create Multisig Route (/create-multisig)
 *
 * Create static or flexible multisig account with customizable threshold
 * and member management via proxy layer
 */
export const Route = createFileRoute('/_authenticated/create-multisig')({
  staticData: {
    title: 'Create Multisig'
  } as RouteMetadata,
  component: PageCreateMultisig
});
