// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react';

import { useAccounts, useAddresses } from '@mimirdev/hooks';
import { getAddressMeta } from '@mimirdev/utils';

interface UseSelectMultisig {
  unselected: string[];
  signatories: string[];
  select: (value: string) => void;
  unselect: (value: string) => void;
}

export function useSelectMultisig(defaultSignatories?: string[]): UseSelectMultisig {
  const { allAccounts } = useAccounts();
  const { allAddresses } = useAddresses();
  const all = useMemo(() => allAddresses.concat(allAccounts.filter((item) => !getAddressMeta(item).isHidden)), [allAccounts, allAddresses]);
  const [signatories, setSignatories] = useState<string[]>(defaultSignatories || []);

  const unselected = useMemo(() => all.filter((account) => !signatories.includes(account)), [all, signatories]);

  const select = useCallback((value: string) => {
    setSignatories((accounts) => (accounts.includes(value) ? accounts : accounts.concat(value)));
  }, []);

  const unselect = useCallback((value: string) => {
    setSignatories((accounts) => accounts.filter((account) => account !== value));
  }, []);

  return {
    unselected,
    signatories,
    select,
    unselect
  };
}
