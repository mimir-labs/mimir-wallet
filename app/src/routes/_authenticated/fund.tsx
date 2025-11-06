// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import PageFund from '@/pages/fund';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Fund Account Route (/fund)
 *
 * Fund pure or multisig accounts with guided transfer form,
 * reusable via query params for AI prompts and shortcuts
 */
export const Route = createFileRoute('/_authenticated/fund')({
  component: PageFund
});
