// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { InputNumberProps } from './types';

import { Box, Button } from '@mui/material';
import { BN, BN_TEN, BN_ZERO } from '@polkadot/util';
import React, { useCallback, useMemo, useState } from 'react';

import { useApi } from '@mimir-wallet/hooks';

import FormatBalance from './FormatBalance';
import Input from './Input';

function inputToBn(api: ApiPromise, input: string, decimals = api.registry.chainDecimals[0]): BN {
  const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);

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

function bnToInput(api: ApiPromise, bn: BN, decimals = api.registry.chainDecimals[0]): string {
  let mod = bn.toString().slice(-decimals);
  const div = bn.toString().slice(0, -decimals);

  if (mod.length < decimals) {
    mod = `${Array.from({ length: decimals - mod.length })
      .map(() => 0)
      .join('')}${mod}`;
  }

  if (new BN(mod).eq(BN_ZERO)) {
    return div;
  }

  return `${div || 0}.${mod}`;
}

function getValues(api: ApiPromise, value: BN, decimals = api.registry.chainDecimals[0]): [string, BN] {
  return [bnToInput(api, value, decimals), value];
}

function InputNumber({
  defaultValue,
  format,
  maxValue,
  onChange,
  value: propsValue,
  withMax,
  ...props
}: InputNumberProps) {
  const { api } = useApi();
  const _defaultValue = useMemo(() => defaultValue?.toString(), [defaultValue]);
  const [[value], setValues] = useState<[string, BN]>(
    getValues(api, new BN(propsValue || _defaultValue || '0'), format?.[0])
  );

  const _onChange = useCallback(
    (value: string) => {
      setValues([value, inputToBn(api, value, format?.[0])]);
      onChange?.(inputToBn(api, value, format?.[0]));
    },
    [api, format, onChange]
  );

  return (
    <Input
      type='number'
      {...props}
      defaultValue={_defaultValue}
      endAdornment={
        <>
          {props.endAdornment}
          {withMax && (
            <Button
              onClick={() => setValues(getValues(api, maxValue || BN_ZERO, format?.[0]))}
              size='small'
              sx={{ paddingY: 0.2, borderRadius: 0.5 }}
              variant='outlined'
            >
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
            <FormatBalance format={format} value={maxValue} />
          </Box>
        </Box>
      }
      onChange={_onChange}
      value={value}
    />
  );
}

export default React.memo(InputNumber);
