// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLazyFileRoute } from '@tanstack/react-router';

import PageProfile from '@/pages/profile';

export const Route = createLazyFileRoute('/_authenticated/')({
  component: PageProfile,
});
