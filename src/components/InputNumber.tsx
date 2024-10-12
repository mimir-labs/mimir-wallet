// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InputNumberProps } from './types';

import { Box, Button } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { useInputNumber } from '@mimir-wallet/hooks';

import FormatBalance from './FormatBalance';
import Input from './Input';

function InputNumber({
  defaultValue,
  format,
  maxValue,
  onChange,
  value: propsValue,
  withMax,
  ...props
}: InputNumberProps) {
  const _defaultValue = useMemo(() => defaultValue?.toString(), [defaultValue]);
  const [[value], setValue] = useInputNumber(_defaultValue);

  const _onChange = useCallback(
    (value: string) => {
      setValue(value);
      onChange?.(value);
    },
    [onChange, setValue]
  );

  return (
    <Input
      {...props}
      defaultValue={_defaultValue}
      endAdornment={
        <>
          {props.endAdornment}
          {withMax && maxValue && (
            <Button
              onClick={() => setValue(maxValue.toString())}
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
            <FormatBalance format={format} value={maxValue?.toString()} />
          </Box>
        </Box>
      }
      onChange={_onChange}
      value={value}
    />
  );
}

export default React.memo(InputNumber);
