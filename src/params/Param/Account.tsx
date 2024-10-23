// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { AddressRow } from '@mimir-wallet/components';

import { ParamProps } from './types';

function Account({ value }: ParamProps) {
  return <AddressRow iconSize={20} shorten={false} value={value.toString()} withAddress={false} withCopy withName />;
}

export default React.memo(Account);
