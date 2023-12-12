// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types/types';
import type { CallProps } from './types';

import React, { useMemo } from 'react';
import ReactJson from 'react-json-view';

import BatchCall from './BatchCall';
import CancelCall from './CancelCall';
import TransferCall from './TransferCall';

function findAction(api: ApiPromise, call: IMethod | Call) {
  const callFunc = api.registry.findMetaCall(call.callIndex);

  return `${callFunc.section}.${callFunc.method}`;
}

function Call({ api, call, type, ...props }: CallProps) {
  const action = useMemo(() => findAction(api, call), [api, call]);

  if (action === 'multisig.cancelAsMulti') {
    return <CancelCall api={api} call={call} type={type} {...props} />;
  } else if (action === 'utility.batchAll') {
    return <BatchCall api={api} call={call} type={type} {...props} />;
  } else if (action.startsWith('balances.')) {
    return <TransferCall api={api} call={call} type={type} {...props} />;
  } else {
    return <ReactJson enableClipboard indentWidth={2} src={call.toHuman() as any} />;
  }
}

export default React.memo(Call);
