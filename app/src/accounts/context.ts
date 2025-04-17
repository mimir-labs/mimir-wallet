// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, AddressMeta } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { createContext } from 'react';

export const AccountContext = createContext<{
  metas: Record<HexString, AddressMeta>;
  updateMetas: (account: AccountData) => void;
}>({ metas: {}, updateMetas: () => {} });
