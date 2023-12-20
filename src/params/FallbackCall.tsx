// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { IMethod } from '@polkadot/types-codec/types';

import React from 'react';
import ReactJson from 'react-json-view';

function FallbackCall({ call }: { call: Call | IMethod }) {
  return <ReactJson enableClipboard indentWidth={2} src={call.toHuman() as any} theme='summerfruit:inverted' />;
}

export default React.memo(FallbackCall);
