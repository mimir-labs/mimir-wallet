// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InputNumberProps } from './types';

import { Button } from '@mimir-wallet/ui';
import React, { useCallback, useMemo } from 'react';

import FormatBalance from './FormatBalance';
import Input from './Input';

import { useInputNumber } from '@/hooks/useInputNumber';

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
              onClick={() => setValue(maxValue.toString())}
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
