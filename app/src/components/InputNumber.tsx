// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InputNumberProps } from './types';

import { useInputNumber } from '@/hooks/useInputNumber';
import React, { useCallback, useMemo } from 'react';

import { Button } from '@mimir-wallet/ui';

import FormatBalance from './FormatBalance';
import Input from './Input';

function InputNumber({ defaultValue, format, maxValue, onChange, withMax, ...props }: InputNumberProps) {
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
              onPress={() => setValue(maxValue.toString())}
              size='sm'
              variant='ghost'
              className='rounded-[5px] py-[2px]'
            >
              Max
            </Button>
          )}
        </>
      }
      label={
        <div className='flex justify-between'>
          {props.label}
          <div className='font-normal'>
            Balance:
            <FormatBalance format={format} value={maxValue?.toString()} />
          </div>
        </div>
      }
      onChange={_onChange}
      value={value}
    />
  );
}

export default React.memo(InputNumber);
