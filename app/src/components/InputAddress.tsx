// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { InputAddressProps } from './types';

import { useAccount } from '@/accounts/useAccount';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import { useToggle } from '@/hooks/useToggle';
import {
  Box,
  Fade,
  FormHelperText,
  InputBase,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { isAddress } from '@polkadot/util-crypto';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AddressCell from './AddressCell';
import FormatBalance from './FormatBalance';

function createOptions(
  accounts: AccountData[],
  addresses: { address: string; name: string }[],
  isSign: boolean,
  input?: string,
  filtered?: string[],
  excluded?: string[]
): string[] {
  const all = accounts.reduce<Record<string, string | null | undefined>>((result, item) => {
    result[item.address] = item.name;

    return result;
  }, {});

  if (!isSign) {
    addresses.reduce<Record<string, string | null | undefined>>((result, item) => {
      result[item.address] = item.name;

      return result;
    }, all);
  }

  let options = Object.entries(all);

  if (filtered) {
    options = options.filter((option) => filtered.includes(option[0]));
  }

  if (excluded) {
    options = options.filter((option) => !excluded.includes(option[0]));
  }

  if (!input) return options.map((item) => item[0]);

  return options
    .filter(([address, name]) => {
      return (
        address.toLowerCase().includes(input.toLowerCase()) ||
        (name ? name.toLowerCase().includes(input.toLowerCase()) : false)
      );
    })
    .map((item) => item[0]);
}

function InputAddress({
  balance,
  defaultValue,
  disabled,
  error,
  filtered,
  excluded,
  format,
  isSign = false,
  label,
  onChange,
  placeholder,
  shorten,
  value: propsValue,
  withBalance
}: InputAddressProps) {
  const { accounts, addresses, isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const isControl = useRef(propsValue !== undefined);
  const [value, setValue] = useState<string>(
    isAddress(propsValue || defaultValue) ? propsValue || defaultValue || '' : ''
  );
  const [inputValue, setInputValue] = useState<string>('');
  const [focus, , setFocus] = useToggle();
  const wrapper = useRef<HTMLDivElement | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const open = !!anchorEl;
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const options = useMemo(
    (): string[] => createOptions(accounts, addresses, isSign, inputValue, filtered, excluded),
    [accounts, addresses, excluded, filtered, inputValue, isSign]
  );

  const _onChange = useCallback(
    (value: string) => {
      if (isAddress(value) && !inputValue.startsWith('0x')) {
        if (!isControl.current) {
          setValue(value);
        }

        onChange?.(value);
      }
    },
    [inputValue, onChange]
  );

  const handleFocus = useCallback(() => {
    setAnchorEl(wrapper.current);
    setFocus(true);
  }, [setFocus]);

  const handleBlur = useCallback(() => {
    setAnchorEl(null);
    setFocus(false);

    if (isAddress(inputValue) && !inputValue.startsWith('0x')) {
      _onChange(inputValue);
    }
  }, [_onChange, inputValue, setFocus]);

  useEffect(() => {
    if (isControl.current) {
      setValue(propsValue || '');
    }
  }, [propsValue]);

  const width = wrapper.current?.clientWidth;

  return (
    <Box sx={{ overflow: 'hidden', width: '100%' }}>
      {label && (
        <Typography sx={{ fontWeight: 700, marginBottom: 1, color: focus ? 'primary.main' : 'inherit' }}>
          {label}
        </Typography>
      )}
      <Box
        ref={wrapper}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: 60,
          padding: 1,
          borderRadius: 1,
          border: '1px solid',
          borderColor: disabled ? 'transparent' : focus ? 'primary.main' : 'grey.300',
          bgcolor: disabled ? 'secondary.main' : undefined,
          '.AddressCell-Content': {
            transition: 'all 0.15s',
            opacity: focus || !value ? 0 : 1,
            pointerEvents: focus || !value ? 'none' : undefined
          }
        }}
      >
        <AddressCell shorten={downSm ? true : shorten} value={value} showType />
        <InputBase
          disabled={disabled}
          onBlur={handleBlur}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleFocus}
          placeholder={value ? '' : placeholder}
          sx={{ opacity: focus ? 1 : 0, paddingLeft: 4.5, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          value={inputValue}
          endAdornment={<SvgIcon component={ArrowDown} inheritViewBox color='primary' />}
        />
        <Popper
          anchorEl={anchorEl}
          placement='bottom-start'
          open={open}
          sx={{ width, minWidth: 300, maxWidth: '95vw', zIndex: 1300 }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper sx={{ maxHeight: 280, overflowY: 'scroll' }}>
                <MenuList>
                  {options.length > 0 ? (
                    options.map((item, index) => (
                      <MenuItem key={index} onClick={() => _onChange(item)}>
                        <AddressCell shorten={!!downSm} showType value={item} />
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
      {value && !isLocalAccount(value) && !isLocalAddress(value) && (
        <Box
          component='span'
          sx={{
            cursor: 'pointer',
            marginTop: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.75rem',
            color: 'primary.main'
          }}
          onClick={() => {
            addAddressBook(value);
          }}
        >
          <SvgIcon component={IconAddressBook} inheritViewBox />
          Add to address book
        </Box>
      )}
      {withBalance && (
        <Typography sx={{ marginTop: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
          Balance:
          <FormatBalance format={format} value={balance} />
        </Typography>
      )}
      {error && <FormHelperText sx={{ color: 'error.main' }}>{error.message}</FormHelperText>}
    </Box>
  );
}

export default React.memo(InputAddress);
