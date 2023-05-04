// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointOption } from '@mimirdev/app-config/types';

import { useMemo } from 'react';

import { findEndpoint } from '@mimirdev/app-config';

import { createNamedHook } from './createNamedHook';
import { useApi } from './useApi';

function useEndpointImpl(): EndpointOption | undefined {
  const { specName } = useApi();

  const endpoint = useMemo((): EndpointOption | undefined => findEndpoint(specName), [specName]);

  return endpoint;
}

export const useEndpoint = createNamedHook('useEndpoint', useEndpointImpl);
