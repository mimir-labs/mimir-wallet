// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiProps } from '@mimirdev/api/types';

import { useContext } from 'react';

import { ApiCtx } from '@mimirdev/api';

import { createNamedHook } from './createNamedHook';

function useApiImpl(): ApiProps {
  return useContext(ApiCtx);
}

export const useApi = createNamedHook('useApi', useApiImpl);
