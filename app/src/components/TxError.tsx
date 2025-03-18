// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { TxDispatchError, TxModuleError } from '@mimir-wallet/polkadot-core';

function TxError({ error }: { error: unknown }) {
  if (error instanceof TxModuleError) {
    return error.shortMessage;
  }

  if (error instanceof TxDispatchError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed!';
}

export default React.memo(TxError);
