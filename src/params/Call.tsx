// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call as ICall } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types/types';
import type { CallProps } from './types';

import React, { useMemo } from 'react';
import ReactJson from 'react-json-view';

import BatchCall from './BatchCall';
import CancelCall from './CancelCall';
import TransferCall from './TransferCall';

function findAction(api: ApiPromise, call: IMethod | ICall) {
  const callFunc = api.registry.findMetaCall(call.callIndex);

  return `${callFunc.section}.${callFunc.method}`;
}

function Call({ api, call, jsonFallback, type, ...props }: CallProps) {
  const action = useMemo(() => (call ? findAction(api, call) : 'unknown'), [api, call]);

  if (action === 'multisig.cancelAsMulti') {
    return <CancelCall api={api} call={call} type={type} {...props} />;
  } else if (action === 'utility.batchAll') {
    return <BatchCall api={api} call={call} type={type} {...props} />;
  } else if (action.startsWith('balances.')) {
    return <TransferCall api={api} call={call} type={type} {...props} />;
  } else {
    return jsonFallback ? <ReactJson enableClipboard indentWidth={2} src={call.toHuman() as any} theme='summerfruit:inverted' /> : null;
  }
}

export default React.memo(Call);
