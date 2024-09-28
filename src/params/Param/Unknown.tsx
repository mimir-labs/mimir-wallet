// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { ParamProps } from './types';

function Unknown({ value }: ParamProps) {
  return value.value.toString();
}

export default React.memo(Unknown);
