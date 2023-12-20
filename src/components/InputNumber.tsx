// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { InputNumberProps } from './types';

import { useApi } from '@mimir-wallet/hooks';
import { Box, Button } from '@mui/material';
import { BN, BN_TEN, BN_ZERO } from '@polkadot/util';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import FormatBalance from './FormatBalance';
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
  const isControl = useRef(propsValue !== undefined);
  const { api } = useApi();
  const _defaultValue = useMemo(() => defaultValue?.toString(), [defaultValue]);
  const [[value], setValues] = useState<[string, BN]>(getValues(api, new BN(propsValue || _defaultValue || '0')));

  const _onChange = useCallback(
    (value: string) => {
      if (!isControl.current) {
        setValues([value, inputToBn(api, value)]);
      }

      onChange?.(inputToBn(api, value));
    },
    [api, onChange]
  );

  useEffect(() => {
    if (isControl.current) {
      propsValue && setValues(getValues(api, propsValue));
    }
  }, [api, propsValue]);

  return (
    <Input
      type='number'
      {...props}
      defaultValue={_defaultValue}
      endAdornment={
        <>
          {props.endAdornment}
          {withMax && (
            <Button onClick={() => setValues(getValues(api, maxValue || BN_ZERO))} size='small' sx={{ paddingY: 0.2, borderRadius: 0.5 }} variant='outlined'>
              Max
            </Button>
          )}
        </>
      }
      label={
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {props.label}
          <Box component='span' fontWeight={400}>
            Balance:
            <FormatBalance value={maxValue} />
          </Box>
        </Box>
      }
      onChange={_onChange}
      value={value}
    />
  );
}

export default React.memo(InputNumber);
