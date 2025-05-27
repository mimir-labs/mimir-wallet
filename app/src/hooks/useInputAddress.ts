// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';

import { isValidAddress } from '@mimir-wallet/polkadot-core';

export function useInputAddress(
  defaultAddress?: string,
  polkavm: boolean = false
): [
  [address: string, isValidAddress: boolean],
  setAddress: (value: string | React.ChangeEvent<HTMLInputElement>) => void
] {
  const [value, setValue] = useState<[string, boolean]>([
    defaultAddress || '',
    defaultAddress ? isValidAddress(defaultAddress, polkavm) : false
  ]);

  const onChange = useCallback(
    (_value: string | React.ChangeEvent<HTMLInputElement>) => {
      if (typeof _value === 'string') {
        setValue([_value, _value ? isValidAddress(_value, polkavm) : true]);
      } else {
        setValue([_value.target.value, _value.target.value ? isValidAddress(_value.target.value, polkavm) : true]);
      }
    },
    [polkavm]
  );

  return [value, onChange];
}
