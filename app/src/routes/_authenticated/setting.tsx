// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import PageSetting from '@/pages/setting';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

/**
 * Settings Route (/setting)
 *
 * Unified settings page with:
 * - Account Settings: multisig member updates, threshold changes, proposer roles, proxy configuration
 * - General Settings: network RPC endpoints, account visibility, Mimo AI assistant, notifications
 */

const settingSearchSchema = z.object({
  type: z.enum(['account', 'general']).optional().default('general'),
  tabs: z.enum(['network', 'account-display', 'notification']).optional()
});

export const Route = createFileRoute('/_authenticated/setting')({
  validateSearch: settingSearchSchema,
  beforeLoad: ({ search }) => {
    // Skip connection checks for general settings
    // - type=general with tabs=network: network configuration (no wallet needed)
    // - type=general with other tabs or no tabs: general settings (no wallet needed)
    // Account settings (type=account) require full connection
    const shouldSkipConnect = search.type === 'general';

    return {
      layoutOptions: {
        skipConnect: shouldSkipConnect
      }
    };
  },
  staticData: {
    title: 'Setting'
  } as RouteMetadata,
  component: PageSetting
});
