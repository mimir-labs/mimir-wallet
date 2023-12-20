// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiProps } from '@mimir-wallet/api/types';

import { ApiCtx } from '@mimir-wallet/api';
import { useContext } from 'react';

import { createNamedHook } from './createNamedHook';

function useApiImpl(): ApiProps {
  return useContext(ApiCtx);
}

export const useApi = createNamedHook('useApi', useApiImpl);
