// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Filtered } from '@mimir-wallet/hooks/ctx/types';
import type { Transaction } from '@mimir-wallet/hooks/types';

import { useEffect, useState } from 'react';

import { checkFiltered, extraFiltered, removeEmptyMultisigFiltered, removeMultisigDeepFiltered, removeSuccessFiltered } from './util';

export function useApproveFiltered(transaction: Transaction): [filtered: Filtered | undefined, canApprove: boolean] {
  const [filtered, setFiltered] = useState<Filtered>();
  const [canApprove, setCanApprove] = useState<boolean>(false);

  useEffect(() => {
    const filtered = extraFiltered(transaction.sender);

    removeSuccessFiltered(transaction, filtered);
    removeMultisigDeepFiltered(transaction, filtered);
    removeEmptyMultisigFiltered(filtered);

    setFiltered(filtered);
    setCanApprove(checkFiltered(filtered));
  }, [transaction]);

  return [filtered, canApprove];
}
