// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Fade, FormHelperText, InputBase, MenuItem, MenuList, Paper, Popper, Typography } from '@mui/material';
import { keyring } from '@polkadot/ui-keyring';
import { isAddress } from '@polkadot/util-crypto';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useToggle } from '@mimirdev/hooks';
import { getAddressMeta } from '@mimirdev/utils';

import AddressCell from './AddressCell';
import FormatBalance from './FormatBalance';
import { InputAddressProps } from './types';

function filterOptions(options: string[], input: string): string[] {
  if (!input) return options;

  return options.filter((address) => {
    const meta = getAddressMeta(address);

    return address.toLowerCase().includes(input.toLowerCase()) || (meta.name ? meta.name.toLowerCase().includes(input.toLowerCase()) : false);
  });
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

function InputAddress({ balance, defaultValue, disabled, error, filtered, isSign = false, label, onChange, placeholder, value: propsValue, withBalance }: InputAddressProps) {
  const isControl = useRef(propsValue !== undefined);
  const [value, setValue] = useState<string>(isAddress(propsValue || defaultValue) ? propsValue || defaultValue || '' : '');
  const [inputValue, setInputValue] = useState<string>('');
  const [focus, , setFocus] = useToggle();
  const wrapper = useRef<HTMLDivElement | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const open = !!anchorEl;

  const options = useMemo((): string[] => filterOptions(createOptions(isSign, filtered), inputValue), [filtered, inputValue, isSign]);

  const _onChange = useCallback(
    (value: string) => {
      if (isAddress(value)) {
        if (!isControl.current) {
          setValue(value);
        }

        onChange?.(value);
      }
    },
    [onChange]
  );

  const handleFocus = useCallback(() => {
    setAnchorEl(wrapper.current);
    setFocus(true);
  }, [setFocus]);

  const handleBlur = useCallback(() => {
    setAnchorEl(null);
    setFocus(false);

    if (isAddress(inputValue)) {
      _onChange(inputValue);
    }
  }, [_onChange, inputValue, setFocus]);

  useEffect(() => {
    if (isControl.current) {
      propsValue && setValue(propsValue);
    }
  }, [propsValue]);

  const width = wrapper.current?.clientWidth;

  return (
    <Box>
      <Typography sx={{ fontWeight: 700, marginBottom: 1, color: focus ? 'primary.main' : 'inherit' }}>{label}</Typography>
      <Box
        ref={wrapper}
        sx={{
          position: 'relative',
          padding: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: focus ? 'primary.main' : 'grey.300',
          '.AddressCell-Address': {
            transition: 'all 0.15s',
            opacity: focus || !value ? 0 : 1,
            pointerEvents: focus || !value ? 'none' : undefined
          }
        }}
      >
        <AddressCell shorten={false} size='small' value={value} />
        <InputBase
          disabled={disabled}
          onBlur={handleBlur}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          sx={{ opacity: focus ? 1 : 0, paddingLeft: 4.5, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          value={inputValue}
        />
        <Popper anchorEl={anchorEl} open={open} sx={{ width, zIndex: 1300 }} transition>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper sx={{ maxHeight: 280, overflowY: 'scroll' }}>
                <MenuList>
                  {options.length > 0 ? (
                    options.map((item, index) => (
                      <MenuItem key={index} onClick={() => _onChange(item)}>
                        <AddressCell shorten={false} size='small' value={item} />
                      </MenuItem>
                    ))
                  ) : (
                    <Typography color='text.secondary' sx={{ paddingX: 1 }}>
                      No Address found
                    </Typography>
                  )}
                </MenuList>
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
      {withBalance && (
        <Typography sx={{ marginTop: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
          Balance:
          <FormatBalance value={balance} />
        </Typography>
      )}
      {error && <FormHelperText sx={{ color: 'error.main' }}>{error.message}</FormHelperText>}
    </Box>
  );
}

export default React.memo(InputAddress);
