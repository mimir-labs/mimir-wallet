// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamProps } from './types';

import React, { useMemo } from 'react';

import findComponent from './findComponent';

function Param({ registry, displayType, value, type, name }: ParamProps) {
  const Comp = useMemo(() => findComponent(registry, type), [type, registry]);

  return <Comp displayType={displayType} registry={registry} name={name} type={type} value={value} />;
}

export default React.memo(Param);
