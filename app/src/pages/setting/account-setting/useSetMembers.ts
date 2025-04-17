// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import { useAccount } from '@/accounts/useAccount';
import { accountSource } from '@/wallet/useWallet';
import { useCallback, useMemo, useState } from 'react';

interface UseSetMembers {
  unselected: string[];
  signatories: string[];
  threshold: number;
  isThresholdValid: boolean;
  hasSoloAccount: boolean;
  setThreshold: React.Dispatch<React.SetStateAction<number>>;
  select: (value: string) => void;
  unselect: (value: string) => void;
}

export function useSetMembers(defaultSignatories: string[], defaultThreshold: number): UseSetMembers {
  const { accounts, addresses } = useAccount();
  const all = useMemo(
    () => accounts.map((item) => item.address).concat(addresses.map((item) => item.address)),
    [accounts, addresses]
  );
  const [signatories, setSignatories] = useState<string[]>(defaultSignatories);
  const [threshold, setThreshold] = useState<number>(defaultThreshold);

  const unselected = useMemo(
    () => Array.from(new Set(all.filter((account) => !signatories.includes(account)))),
    [all, signatories]
  );

  const hasSoloAccount = useMemo(() => !!signatories.find((address) => !!accountSource(address)), [signatories]);
  const isThresholdValid = Number(threshold) >= 1 && Number(threshold) <= signatories.length;

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
