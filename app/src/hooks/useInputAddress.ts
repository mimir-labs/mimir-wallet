// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isAddress } from '@polkadot/util-crypto';
import { useCallback, useState } from 'react';

export function useInputAddress(
  defaultAddress?: string
): [
  [address: string, isValidAddress: boolean],
  setAddress: (value: string | React.ChangeEvent<HTMLInputElement>) => void
] {
  const [value, setValue] = useState<[string, boolean]>([
    defaultAddress || '',
    defaultAddress ? isAddress(defaultAddress) : false
  ]);

  const onChange = useCallback((_value: string | React.ChangeEvent<HTMLInputElement>) => {
    if (typeof _value === 'string') {
      setValue([_value, _value ? isAddress(_value) : true]);
    } else {
      setValue([_value.target.value, _value.target.value ? isAddress(_value.target.value) : true]);
    }
  }, []);

  return [value, onChange];
}
