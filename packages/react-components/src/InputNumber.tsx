// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { InputNumberProps } from './types';

import { Button } from '@mui/material';
import { BN, BN_TEN, BN_ZERO } from '@polkadot/util';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useApi } from '@mimirdev/react-hooks';

import Input from './Input';

function inputToBn(api: ApiPromise, input: string): BN {
  const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);
  const decimals = api.registry.chainDecimals[0];

  let result;

  if (isDecimalValue) {
    const div = new BN(input.replace(/\.\d*$/, ''));
    const modString = input.replace(/^\d+\./, '').substring(0, decimals);
    const mod = new BN(modString);

    result = div.mul(BN_TEN.pow(new BN(decimals))).add(mod.mul(BN_TEN.pow(new BN(decimals - modString.length))));
  } else {
    result = new BN(input.replace(/[^\d]/g, '')).mul(BN_TEN.pow(new BN(decimals)));
  }

  return result;
}

function bnToInput(api: ApiPromise, bn: BN): string {
  const decimals = api.registry.chainDecimals[0];

  const mod = bn.toString().slice(-decimals);
  const div = bn.toString().slice(0, -decimals);

  if (new BN(mod).eq(BN_ZERO)) {
    return div;
  } else {
    return `${div}.${mod}`;
  }
}

function getValues(api: ApiPromise, value: BN): [string, BN] {
  return [bnToInput(api, value), value];
}

function InputNumber({ defaultValue, maxValue, onChange, value: propsValue, withMax, ...props }: InputNumberProps) {
  const { api } = useApi();
  const _defaultValue = useMemo(() => defaultValue?.toString(), [defaultValue]);
  const [[value, valueBn], setValues] = useState<[string, BN]>(getValues(api, new BN(propsValue || _defaultValue || '0')));

  useEffect(() => {
    onChange?.(valueBn);
  }, [onChange, valueBn]);

  const _onChange = useCallback(
    (value: string) => {
      setValues([value, inputToBn(api, value)]);
    },
    [api]
  );

  return (
    <Input
      {...props}
      defaultValue={_defaultValue}
      endAdornment={
        <>
          {props.endAdornment}
          {withMax && (
            <Button onClick={() => setValues(getValues(api, maxValue || BN_ZERO))} size='small' variant='outlined'>
              Max
            </Button>
          )}
        </>
      }
      onChange={_onChange}
      value={value}
    />
  );
}

export default React.memo(InputNumber);
