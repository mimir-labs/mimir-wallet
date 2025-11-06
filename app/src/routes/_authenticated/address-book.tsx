// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RouteMetadata } from '@/hooks/usePageTitle';

import PageAddressBook from '@/pages/address-book';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

/**
 * Address Book Route (/address-book)
 *
 * Address book for frequently used Polkadot addresses, multisig members,
 * and proxy accounts with identity integration
 */

const addressBookSearchSchema = z.object({
  tab: z.enum(['contacts', 'watchlist']).optional().default('contacts')
});

export const Route = createFileRoute('/_authenticated/address-book')({
  validateSearch: addressBookSearchSchema,
  staticData: {
    title: 'Address Book'
  } as RouteMetadata,
  component: PageAddressBook
});
