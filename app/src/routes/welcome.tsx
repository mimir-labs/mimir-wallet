// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import PageWelcome from '@/pages/profile/Welcome';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Welcome Page Route (/welcome)
 *
 * Onboarding wizard introducing Mimir multisig features, account structure,
 * and Polkadot ecosystem integration
 */
export const Route = createFileRoute('/welcome')({
  staticData: {
    title: 'Welcome'
  } as RouteMetadata,
  component: PageWelcome
});
