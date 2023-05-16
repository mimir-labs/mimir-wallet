// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsicFunction } from '@polkadot/api-base/types';

import React from 'react';

import { TxButton } from '@mimirdev/react-components';

interface Props {
  tx: SubmittableExtrinsicFunction<'promise'>;
  params?: unknown[] | (() => unknown[]) | null;
  accountId: string;
}

function CancelButton({ accountId, params, tx }: Props) {
  return (
    <TxButton accountId={accountId} isMultisigCancel params={params} tx={tx} variant='outlined'>
      Cancel
    </TxButton>
  );
}

export default React.memo(CancelButton);
