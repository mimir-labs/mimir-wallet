// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Autocomplete, createFilterOptions, FilterOptionsState, FormControl, FormHelperText, InputAdornment, InputLabel, MenuItem, OutlinedInput } from '@mui/material';
import { keyring } from '@polkadot/ui-keyring';
import { isAddress } from '@polkadot/util-crypto';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useToggle } from '@mimirdev/hooks';
import { getAddressMeta } from '@mimirdev/utils';

import AddressCell from './AddressCell';
import FormatBalance from './FormatBalance';
import IdentityIcon from './IdentityIcon';
import { InputAddressProps } from './types';

const filter = createFilterOptions<string>();

function filterOptions(options: string[], params: FilterOptionsState<string>): string[] {
  const filtered = filter(options, params);

  const { inputValue } = params;
  // Suggest the creation of a new value
  const isExisting = options.some((option) => inputValue === option);

  if (isAddress(inputValue) && !isExisting) {
    filtered.push(inputValue);
  }

  return filtered;
}

function createOptions(isSign: boolean, filtered?: string[]): string[] {
  const options: string[] = keyring.getAccounts().map((account) => account.address);

  if (!isSign) {
    options.push(...keyring.getAddresses().map((address) => address.address));
  }

  if (filtered) {
    return options.filter((option) => filtered.includes(option));
  }

  return options;
}

function InputAddress({
  balance,
  defaultValue,
  disabled,
  endAdornment,
  error,
  filtered,
  fullWidth,
  isSign = false,
  label,
  onChange,
  placeholder,
  size,
  startAdornment,
  value: propsValue,
  withBalance
}: InputAddressProps) {
  const isControl = useRef(propsValue !== undefined);
  const [value, setValue] = useState<string>(isAddress(propsValue || defaultValue) ? propsValue || defaultValue || '' : '');
  const [open, , setOpen] = useToggle();

  const options = useMemo((): string[] => createOptions(isSign, filtered), [filtered, isSign]);

  const _onChange = (value: string) => {
    if (isAddress(value)) {
      setValue(value);
      onChange?.(value);
    }
  };

  useEffect(() => {
    if (isControl.current) {
      propsValue && setValue(propsValue);
    }
  }, [propsValue]);

  return (
    <Autocomplete<string, undefined, true, true>
      disableClearable
      disableListWrap
      disabled={disabled}
      filterOptions={filterOptions}
      fullWidth={fullWidth}
      isOptionEqualToValue={(value) => isAddress(value)}
      onChange={(_, newValue) => {
        _onChange(newValue);
      }}
      open={open}
      options={options}
      renderInput={(params) => {
        const name = params.inputProps.value ? getAddressMeta(params.inputProps.value as string)?.name : null;

        return (
          <FormControl color={error ? 'error' : undefined} error={!!error} fullWidth={params.fullWidth}>
            {label && (
              <InputLabel {...params.InputLabelProps} shrink>
                {label}
              </InputLabel>
            )}
            <OutlinedInput
              {...params.InputProps}
              defaultValue={defaultValue}
              disabled={params.disabled}
              endAdornment={
                <InputAdornment position='end'>
                  {endAdornment}
                  {params.InputProps.endAdornment}
                </InputAdornment>
              }
              inputProps={{ ...params.inputProps, value: open ? params.inputProps.value : name || params.inputProps.value }}
              onBlur={(e) => {
                setOpen(false);
                _onChange(e.target.value);
              }}
              onClick={() => {
                setOpen(true);
              }}
              placeholder={placeholder}
              startAdornment={
                <InputAdornment position='start'>
                  <IdentityIcon size={20} value={value} />
                  {startAdornment}
                </InputAdornment>
              }
            />
            {error ? <FormHelperText>{error.message}</FormHelperText> : null}
            {withBalance ? (
              <FormHelperText>
                Balance:
                <FormatBalance value={balance} />
              </FormHelperText>
            ) : null}
          </FormControl>
        );
      }}
      renderOption={(_, option, { index }) => {
        return (
          <MenuItem
            key={index}
            onClick={() => {
              _onChange(option);
              setOpen(false);
            }}
            selected={option === value}
          >
            <AddressCell shorten={false} size='small' value={option} />
          </MenuItem>
        );
      }}
      selectOnFocus
      size={size}
      value={value}
    />
  );
}

export default React.memo(InputAddress);
