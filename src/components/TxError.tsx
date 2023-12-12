// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { TxDispatchError, TxModuleError } from '@mimirdev/utils';

function TxError({ error }: { error: unknown }) {
  if (error instanceof TxModuleError) {
    return error.shortMessage;
  } else if (error instanceof TxDispatchError) {
    return error.message;
  } else if (error instanceof Error) {
    return error.message;
  }

  return 'Failed!';
}

export default React.memo(TxError);
