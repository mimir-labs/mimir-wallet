// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createFileRoute } from '@tanstack/react-router';

/**
 * Home Page Route (/)
 *
 * Multisig control center with account structure view, balance overview,
 * transaction analytics, and quick actions for Polkadot ecosystem
 */
export const Route = createFileRoute('/_authenticated/')({});
