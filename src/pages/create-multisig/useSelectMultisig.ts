// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccounts, useAddresses, useVisibleAccounts } from '@mimir-wallet/hooks';
import { getAddressMeta } from '@mimir-wallet/utils';
import React, { useCallback, useMemo, useState } from 'react';

interface UseSelectMultisig {
  unselected: string[];
  signatories: string[];
  threshold: number;
  isThresholdValid: boolean;
  hasSoloAccount: boolean;
  setThreshold: React.Dispatch<React.SetStateAction<number>>;
  select: (value: string) => void;
  unselect: (value: string) => void;
}

export function useSelectMultisig(defaultSignatories?: string[]): UseSelectMultisig {
  const { isAccount } = useAccounts();
  const { allAddresses } = useAddresses();
  const all = useVisibleAccounts(allAddresses);
  const [signatories, setSignatories] = useState<string[]>(defaultSignatories || []);
  const [threshold, setThreshold] = useState<number>(2);

  const unselected = useMemo(() => all.filter((account) => !signatories.includes(account)), [all, signatories]);

  const hasSoloAccount = useMemo(() => !!signatories.find((address) => isAccount(address) && !getAddressMeta(address).isMultisig), [isAccount, signatories]);
  const isThresholdValid = Number(threshold) >= 2 && Number(threshold) <= signatories.length;

  const select = useCallback((value: string) => {
    setSignatories((accounts) => (accounts.includes(value) ? accounts : accounts.concat(value)));
  }, []);

  const unselect = useCallback((value: string) => {
    setSignatories((accounts) => accounts.filter((account) => account !== value));
  }, []);

  return {
    unselected,
    signatories,
    threshold,
    isThresholdValid,
    setThreshold,
    hasSoloAccount,
    select,
    unselect
  };
}
