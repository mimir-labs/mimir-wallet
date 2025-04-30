// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WalletConnectState } from './types';

import { createContext } from 'react';

export const WalletConnectContext = createContext<WalletConnectState>({} as WalletConnectState);
