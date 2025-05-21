// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';

import { isPolkadotAddress } from '@mimir-wallet/polkadot-core';

export function useInputAddress(
  defaultAddress?: string
): [
  [address: string, isValidAddress: boolean],
  setAddress: (value: string | React.ChangeEvent<HTMLInputElement>) => void
] {
  const [value, setValue] = useState<[string, boolean]>([
    defaultAddress || '',
    defaultAddress ? isPolkadotAddress(defaultAddress) : false
  ]);

  const onChange = useCallback((_value: string | React.ChangeEvent<HTMLInputElement>) => {
    if (typeof _value === 'string') {
      setValue([_value, _value ? isPolkadotAddress(_value) : true]);
    } else {
      setValue([_value.target.value, _value.target.value ? isPolkadotAddress(_value.target.value) : true]);
    }
  }, []);

  return [value, onChange];
}
