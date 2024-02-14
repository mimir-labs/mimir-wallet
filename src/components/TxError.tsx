// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TxDispatchError, TxModuleError } from '@mimir-wallet/utils';
import React from 'react';

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
