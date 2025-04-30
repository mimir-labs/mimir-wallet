// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InputProps } from './types';

import { useCallback } from 'react';

import { Input as BaseInput } from '@mimir-wallet/ui';

function Input({
  autoComplete,
  autoFocus,
  defaultValue,
  disabled,
  endAdornment,
  endButton,
  enterKeyHint,
  color = 'primary',
  error,
  fullWidth = true,
  helper,
  label,
  onChange,
  placeholder,
  startAdornment,
  tabIndex,
  type,
  value
}: InputProps) {
  const _onChange = useCallback(
    (_value: string) => {
      onChange?.(_value);
    },
    [onChange]
  );

  return (
    <div className='flex items-center gap-2 pt-[calc(theme(fontSize.small)_+_10px)]'>
      <BaseInput
        value={value}
        defaultValue={defaultValue}
        tabIndex={tabIndex}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
        placeholder={placeholder || ' '}
        type={type}
        autoFocus={autoFocus}
        color={color}
        isDisabled={disabled}
        label={label}
        fullWidth={fullWidth}
        errorMessage={error?.message}
        description={helper}
        variant='bordered'
        labelPlacement='outside'
        size='md'
        startContent={startAdornment}
        endContent={endAdornment}
        onValueChange={_onChange}
      />
      {endButton}
    </div>
  );
}

export default Input;
