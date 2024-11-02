// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { AddressCell, AddressRow } from '@mimir-wallet/components';

import { ParamProps } from './types';

function Account({ value, displayType }: ParamProps) {
  if (displayType === 'horizontal') {
    return <AddressCell iconSize={40} value={value.toString()} withCopy />;
  }

  return <AddressRow iconSize={20} shorten={false} value={value.toString()} withAddress={false} withCopy withName />;
}

export default React.memo(Account);
