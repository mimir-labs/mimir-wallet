// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from './types';

import React, { useMemo } from 'react';

import AssetsTransferCall from './AssetsTransferCall';
import BatchCall from './BatchCall';
import FunctionArgs from './FunctionArgs';
import TransferCall from './TransferCall';
import { findAction } from './utils';

function Call({ api, call, ...props }: CallProps) {
  const action = useMemo(() => (call ? findAction(api, call).join('.') : 'unknown.unknown'), [api, call]);

  if (action === 'utility.batchAll' || action === 'utility.batch' || action === 'utility.forceBatch') {
    return <BatchCall api={api} call={call} {...props} />;
  }

  if (action.startsWith('balances.')) {
    return <TransferCall api={api} call={call} {...props} />;
  }

  if (action.startsWith('assets.')) {
    return <AssetsTransferCall api={api} call={call} {...props} />;
  }

  return <FunctionArgs api={api} call={call} {...props} />;
}

export default React.memo(Call);
