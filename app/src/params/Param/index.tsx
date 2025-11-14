// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamProps } from './types';

import { ErrorBoundary } from '@/components';
import React, { createElement, useMemo } from 'react';

import findComponent from './findComponent';

function Param({ registry, displayType, value, type, name }: ParamProps) {
  const Comp = useMemo(() => findComponent(registry, type), [type, registry]);

  return <ErrorBoundary>{createElement(Comp, { displayType, registry, name, type, value })}</ErrorBoundary>;
}

export default React.memo(Param);
