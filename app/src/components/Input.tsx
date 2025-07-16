// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InputProps } from './types';

import { useCallback } from 'react';

import { Input as BaseInput } from '@mimir-wallet/ui';

function Input({
  className = '',
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
  value,
  ...props
}: InputProps) {
  const _onChange = useCallback(
    (_value: string) => {
      onChange?.(_value);
    },
    [onChange]
  );

  return (
    <div className={'flex items-center gap-2 '.concat(className)} style={{ paddingTop: label ? undefined : 0 }}>
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
        isInvalid={!!error}
        errorMessage={error ? error.message : undefined}
        isDisabled={disabled}
        label={label}
        fullWidth={fullWidth}
        description={helper}
        variant='bordered'
        labelPlacement='outside'
        size='md'
        startContent={startAdornment}
        endContent={endAdornment}
        onValueChange={_onChange}
        {...props}
      />
      {endButton}
    </div>
  );
}

export default Input;
