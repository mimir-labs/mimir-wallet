// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Param from './Param';
import { ParamsProps } from './types';

function Params({ params, registry, type = 'base', values }: ParamsProps) {
  return (
    <>
      {params.map((param, index) => (
        <Param key={index} param={param} registry={registry} type={type} value={values[index]} />
      ))}
    </>
  );
}

export default React.memo(Params);
