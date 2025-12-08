// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLazyFileRoute } from '@tanstack/react-router';

import PageSetting from '@/pages/setting';

export const Route = createLazyFileRoute('/_authenticated/setting')({
  component: PageSetting,
});
