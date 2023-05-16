// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InputProps } from './types';

import { Box, FormControl, FormHelperText, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { useCallback } from 'react';

function Input({
  autoComplete,
  autoFocus,
  defaultValue,
  disabled,
  endAdornment,
  endButton,
  enterKeyHint,
  error,
  fullWidth = true,
  inputSx,
  label,
  multiline,
  onBlur,
  onChange,
  onFocus,
  onKeyDown,
  onKeyUp,
  placeholder,
  rows,
  size,
  startAdornment,
  startButton,
  tabIndex,
  type,
  value
}: InputProps) {
  const _onChange = useCallback(
    (e: any) => {
      const _value: string = e.target.value;

      onChange?.(_value);
    },
    [onChange]
  );

  return (
    <FormControl error={!!error} fullWidth={fullWidth} size={size} variant='outlined'>
      {label && <InputLabel shrink>{label}</InputLabel>}
      <Box sx={{ display: 'flex', gap: 1.25, justifyContent: 'space-between' }}>
        {startButton}
        <OutlinedInput
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          defaultValue={defaultValue}
          disabled={disabled}
          endAdornment={endAdornment && <InputAdornment position='end'>{endAdornment}</InputAdornment>}
          inputProps={{
            enterKeyHint
          }}
          multiline={multiline}
          onBlur={onBlur}
          onChange={_onChange}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          placeholder={placeholder}
          rows={rows}
          startAdornment={startAdornment && <InputAdornment position='start'>{startAdornment}</InputAdornment>}
          sx={{ flex: 1, ...inputSx }}
          tabIndex={tabIndex}
          type={type}
          value={value}
        />
        {endButton}
      </Box>
      {error ? <FormHelperText>{error.message}</FormHelperText> : null}
    </FormControl>
  );
}

export default Input;
