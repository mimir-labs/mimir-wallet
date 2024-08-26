// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiProps } from '@mimir-wallet/api/types';

import { useContext } from 'react';

import { ApiCtx } from '@mimir-wallet/api';

import { createNamedHook } from './createNamedHook';

function useApiImpl(): ApiProps {
  return useContext(ApiCtx);
}

export const useApi = createNamedHook('useApi', useApiImpl);
