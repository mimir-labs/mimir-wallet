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

function ApproveButton({ accountId, params, tx }: Props) {
  return (
    <TxButton accountId={accountId} params={params} tx={tx} variant='outlined'>
      Approve
    </TxButton>
  );
}

export default React.memo(ApproveButton);
