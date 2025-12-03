// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import PageSetting from '@/pages/setting';

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
  staticData: {
    title: 'Setting'
  } as RouteMetadata,
  component: PageSetting
});
