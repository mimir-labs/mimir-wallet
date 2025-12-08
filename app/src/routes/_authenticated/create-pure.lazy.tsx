// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createLazyFileRoute } from '@tanstack/react-router';

import PageAddProxy from '@/pages/add-proxy';

export const Route = createLazyFileRoute('/_authenticated/create-pure')({
  component: () => <PageAddProxy pure={true} />,
});
