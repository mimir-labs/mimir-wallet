// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLazyFileRoute } from '@tanstack/react-router';

import PageExplorer from '@/pages/explorer';

export const Route = createLazyFileRoute('/_authenticated/explorer/$url')({
  component: PageExplorer,
});
