// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLazyFileRoute } from '@tanstack/react-router';

import PageTransactionDetails from '@/pages/transaction-details';

export const Route = createLazyFileRoute('/_authenticated/transactions/$id')({
  component: PageTransactionDetails,
});
