// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';

import React, { useMemo } from 'react';

import findComponent from './Param/findComponent';
import { ParamProps } from './Param/types';

function Param({ param, registry, type, value }: ParamProps & { registry: Registry }) {
  const Comp = useMemo(() => findComponent(registry, param.type), [param.type, registry]);

  return <Comp param={param} type={type} value={value} />;
}

export default React.memo(Param);
