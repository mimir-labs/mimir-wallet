// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { hexToU8a } from '@polkadot/util';
import React, { useCallback, useMemo, useState } from 'react';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import { encodeAddress } from '@mimir-wallet/api';
import { accountSource } from '@mimir-wallet/wallet/useWallet';

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

export function useSelectMultisig(
  defaultSignatories?: string[],
  defaultThreshold?: number,
  threshold1?: boolean
): UseSelectMultisig {
  const { accounts, addresses } = useAccount();
  const all = useMemo(
    () =>
      (threshold1 ? [encodeAddress(hexToU8a('0x0', 256))] : []).concat(
        accounts.map((item) => item.address).concat(addresses.map((item) => item.address))
      ),
    [accounts, addresses, threshold1]
  );
  const [signatories, setSignatories] = useState<string[]>(defaultSignatories || []);
  const [threshold, setThreshold] = useState<number>(defaultThreshold || (threshold1 ? 1 : 2));

  const unselected = useMemo(
    () => Array.from(new Set(all.filter((account) => !signatories.includes(account)))),
    [all, signatories]
  );

  const hasSoloAccount = useMemo(() => !!signatories.find((address) => !!accountSource(address)), [signatories]);
  const isThresholdValid = Number(threshold) >= (threshold1 ? 1 : 2) && Number(threshold) <= signatories.length;

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
