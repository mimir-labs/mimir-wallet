// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useState } from 'react';

import { isPositiveNumber, isValidInteger, isValidNumber } from '@mimir-wallet/utils';

export function useInputNumber(
  defaultValue?: string,
  integer: boolean = false,
  min?: number
): [
  [address: string, isValidAddress: boolean],
  setAddress: (value: string | React.ChangeEvent<HTMLInputElement>) => void
] {
  const [value, setValue] = useState<[string, boolean]>([defaultValue?.toString() || '', true]);

  const onChange = useCallback(
    (_value: string | React.ChangeEvent<HTMLInputElement>) => {
      let v: string;

      if (typeof _value === 'string') {
        v = _value;
      } else {
        v = _value.target.value;
      }

      if (!isValidNumber(v) && v !== '-') {
        return;
      }

      if (min !== undefined && min >= 0) {
        if (!isPositiveNumber(v)) {
          return;
        }
      }

      if (integer && v.includes('.')) {
        return;
      }

      setValue([v, v ? (integer ? isValidInteger(v) : isValidNumber(v)) : true]);
    },
    [integer, min]
  );

  return [value, onChange];
}
