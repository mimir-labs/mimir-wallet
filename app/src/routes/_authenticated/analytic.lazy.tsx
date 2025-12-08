// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLazyFileRoute } from '@tanstack/react-router';

import PageAnalytic from '@/pages/analytic';

export const Route = createLazyFileRoute('/_authenticated/analytic')({
  component: PageAnalytic,
});
