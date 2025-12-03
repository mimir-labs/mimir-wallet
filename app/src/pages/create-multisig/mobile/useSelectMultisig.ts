// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import { encodeAddress, useNetwork } from '@mimir-wallet/polkadot-core';
import { hexToU8a } from '@polkadot/util';
import { useCallback, useMemo, useState } from 'react';

import { useAccount } from '@/accounts/useAccount';
import { accountSource } from '@/wallet/useWallet';

interface UseSelectMultisig {
  unselected: string[];
  signatories: string[];
  threshold: number;
  isThresholdValid: boolean;
  hasSoloAccount: boolean;
  setThreshold: React.Dispatch<React.SetStateAction<number>>;
  select: (value: string) => void;
  unselect: (value: string) => void;
  unselectAll: () => void;
}

export function useSelectMultisig(): UseSelectMultisig {
  const { accounts, addresses } = useAccount();
  const { chain } = useNetwork();
  const all = useMemo(
    () =>
      [encodeAddress(hexToU8a('0x0', 256), chain.ss58Format)].concat(
        accounts.map((item) => item.address).concat(addresses.map((item) => item.address))
      ),
    [accounts, addresses, chain.ss58Format]
  );
  const [signatories, setSignatories] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<number>(2);

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
    unselect,
    unselectAll: () => setSignatories([])
  };
}
