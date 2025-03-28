// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { InputAddressProps } from './types';

import { useAccount } from '@/accounts/useAccount';
import IconWarning from '@/assets/svg/icon-warning-fill.svg?react';
import { useInputAddress } from '@/hooks/useInputAddress';
import { useMediaQuery, useTheme } from '@mui/material';
import { isAddress } from '@polkadot/util-crypto';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToggle } from 'react-use';

import { encodeAddress } from '@mimir-wallet/polkadot-core';
import { Avatar, FreeSoloPopover, Listbox, ListboxItem } from '@mimir-wallet/ui';

import Address from './Address';
import AddressCell from './AddressCell';
import AddressName from './AddressName';
import FormatBalance from './FormatBalance';
import IdentityIcon from './IdentityIcon';

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
  className,
  balance,
  iconSize = 30,
  defaultValue,
  disabled,
  filtered,
  excluded,
  format,
  isSign = false,
  label,
  onChange,
  placeholder = 'Address e.g. 5G789...',
  shorten = false,
  value: propsValue,
  withBalance,
  helper
}: InputAddressProps) {
  const isControl = useRef(propsValue !== undefined);
  const { accounts, addresses, isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [value, setValue] = useState<string>(
    isAddress(propsValue || defaultValue) ? propsValue || defaultValue || '' : ''
  );
  // const [inputValue, setInputValue] = useState<string>('');
  const [[inputValue, isValidAddress], setInputValue] = useInputAddress();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useToggle(false);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const options = useMemo(
    (): string[] => createOptions(accounts, addresses, isSign, inputValue, filtered, excluded),
    [accounts, addresses, excluded, filtered, inputValue, isSign]
  );

  useEffect(() => {
    if (isControl.current && propsValue) {
      setValue(propsValue);
    }
  }, [propsValue]);

  useEffect(() => {
    const key = value || '';

    if (isAddress(key)) {
      onChange?.(encodeAddress(key));
    }
  }, [value, onChange]);

  const handleSelect = (item: string) => {
    if (item && isAddress(item)) {
      setValue(item);
    }

    setInputValue('');
    toggleOpen(false);
  };

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);
    if (!isSign && isValidAddress) handleSelect(inputValue);
  };

  const element = (
    <div className='address-cell inline-flex items-center gap-x-2.5 flex-grow-0'>
      {value ? (
        <IdentityIcon size={iconSize} value={value} />
      ) : (
        <Avatar style={{ width: iconSize, height: iconSize }} />
      )}
      {isOpen ? null : value ? (
        <div className='address-cell-content flex flex-col gap-y-1'>
          <div className='inline font-bold text-sm leading-[16px] h-[16px] max-h-[16px] truncate max-w-[90px]'>
            <AddressName value={value} />
          </div>
          <div className='inline-flex items-center gap-1 text-tiny leading-[14px] h-[14px] max-h-[14px] font-normal opacity-50'>
            <Address value={value} shorten={downSm ? true : shorten} />
          </div>
        </div>
      ) : (
        <span className='text-foreground/50'>{placeholder}</span>
      )}
    </div>
  );

  const popoverContent = isOpen ? (
    <FreeSoloPopover
      isOpen
      disableDialogFocus
      onClose={handleClose}
      ref={popoverRef}
      triggerRef={wrapperRef}
      placement='bottom-start'
      style={{ width: wrapperRef.current?.clientWidth }}
    >
      <Listbox color='secondary' emptyContent='no addresses' className='max-h-[250px] overflow-y-auto text-foreground'>
        {options.map((item) => (
          <ListboxItem
            key={item}
            onPress={() => handleSelect(item)}
            className='text-foreground data-[hover=true]:text-foreground'
          >
            <AddressCell value={item} shorten={downSm ? true : shorten} />
          </ListboxItem>
        ))}
      </Listbox>
    </FreeSoloPopover>
  ) : null;

  return (
    <>
      <div
        data-disabled={disabled}
        className={'input-address-wrapper w-full space-y-2 data-[disabled=true]:pointer-events-none'.concat(
          ` ${className || ''}`
        )}
      >
        {label && <div className='font-bold text-small'>{label}</div>}

        <div
          ref={wrapperRef}
          className='InputAddressContent group relative w-full inline-flex tap-highlight-transparent px-2 border-medium min-h-10 rounded-medium flex-col items-start justify-center gap-0 transition-all !duration-150 motion-reduce:transition-none h-14 py-2 shadow-none border-default-200 hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary data-[focus=true]:bg-transparent'
        >
          {element}
          <input
            ref={inputRef}
            className='absolute rounded-medium top-0 right-0 bottom-0 left-0 outline-none border-none pl-12 bg-transparent'
            style={{ opacity: !isOpen ? 0 : 1 }}
            value={inputValue}
            placeholder={placeholder}
            onChange={setInputValue}
            onClick={handleOpen}
          />
        </div>

        {value && !isLocalAccount(value) && !isLocalAddress(value) && (
          <span className='flex items-center gap-1 text-small'>
            <IconWarning className='text-warning' />
            This is an unknown address. You can&nbsp;
            <span
              className='cursor-pointer text-primary'
              onClick={() => {
                addAddressBook(value);
              }}
            >
              add it to your address book
            </span>
          </span>
        )}

        {withBalance && (
          <span className='text-tiny text-foreground/50'>
            Balance:
            <FormatBalance format={format} value={balance} />
          </span>
        )}

        {helper && <div className='text-tiny text-foreground/50'>{helper}</div>}
      </div>

      <AnimatePresence>{popoverContent}</AnimatePresence>
    </>
  );
}

export default React.memo(InputAddress);
