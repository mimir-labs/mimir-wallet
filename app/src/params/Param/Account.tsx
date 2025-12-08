// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ParamProps } from './types';

import React from 'react';

import { AddressCell, AddressRow } from '@/components';

function Account({ value, displayType }: ParamProps) {
  if (displayType === 'horizontal') {
    return <AddressCell iconSize={40} value={value.toString()} withCopy />;
  }

  return (
    <AddressRow
      iconSize={20}
      shorten={false}
      value={value.toString()}
      withAddress={false}
      withCopy
      withName
    />
  );
}

export default React.memo(Account);
