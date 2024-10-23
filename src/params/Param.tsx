// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry, TypeDef } from '@polkadot/types/types';

import React, { useMemo } from 'react';

import findComponent from './Param/findComponent';
import { ParamProps } from './Param/types';

function Param({ registry, value, type, name }: ParamProps & { type: TypeDef; registry: Registry; name?: string }) {
  const Comp = useMemo(() => findComponent(registry, type), [type, registry]);

  return <Comp name={name} type={type} value={value} />;
}

export default React.memo(Param);
