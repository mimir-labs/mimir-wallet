// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLazyFileRoute } from '@tanstack/react-router';

import PageAddressBook from '@/pages/address-book';

export const Route = createLazyFileRoute('/_authenticated/address-book')({
  component: PageAddressBook,
});
