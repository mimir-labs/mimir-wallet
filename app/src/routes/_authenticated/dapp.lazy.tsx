// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLazyFileRoute } from '@tanstack/react-router';

import PageDapp from '@/pages/dapp';

export const Route = createLazyFileRoute('/_authenticated/dapp')({
  component: PageDapp,
});
