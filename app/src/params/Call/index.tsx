// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CallProps } from '../types';

import React, { useMemo } from 'react';

import { findAction } from '@mimir-wallet/polkadot-core';

import BatchCall from './BatchCall';
import CancelAsMulti from './CancelAsMulti';
import FunctionArgs from './FunctionArgs';
import SetIdentity from './SetIdentity';
import TransferCall from './TransferCall';

function Call({ registry, call, ...props }: CallProps) {
  const action = useMemo(() => (call ? findAction(registry, call)?.join('.') : null), [registry, call]);

  if (!action) {
    return null;
  }

  if (action === 'utility.batchAll' || action === 'utility.batch' || action === 'utility.forceBatch') {
    return <BatchCall registry={registry} call={call} {...props} />;
  }

  if (action === 'multisig.cancelAsMulti') {
    return <CancelAsMulti registry={registry} call={call} {...props} />;
  }

  if (action.startsWith('balances.') || action.startsWith('assets.') || action.startsWith('tokens.')) {
    return <TransferCall registry={registry} call={call} {...props} />;
  }

  if (action.startsWith('identity.')) {
    return <SetIdentity registry={registry} call={call} {...props} />;
  }

  return <FunctionArgs registry={registry} call={call} {...props} />;
}

export default React.memo(Call);
