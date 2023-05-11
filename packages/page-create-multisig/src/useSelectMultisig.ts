// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo, useState } from 'react';

import { useAddresses, useGroupAccounts } from '@mimirdev/react-hooks';

interface UseSelectMultisig {
  unselected: string[];
  signatories: string[];
  select: (value: string) => void;
  unselect: (value: string) => void;
}

export function useSelectMultisig(): UseSelectMultisig {
  const { accounts, injected, testing } = useGroupAccounts();
  const { allAddresses } = useAddresses();
  const allAccounts = useMemo(() => allAddresses.concat(injected).concat(accounts).concat(testing), [accounts, allAddresses, injected, testing]);
  const [signatories, setSignatories] = useState<string[]>([]);

  const unselected = useMemo(() => allAccounts.filter((account) => !signatories.includes(account)), [allAccounts, signatories]);

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
