// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, AddressMeta } from '@/hooks/types';
import type { InputAddressProps } from './types';

import { useAccount } from '@/accounts/useAccount';
import { sortAccounts } from '@/accounts/utils';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconWarning from '@/assets/svg/icon-warning-fill.svg?react';
import { useIdentityStore } from '@/hooks/useDeriveAccountInfo';
import { useInputAddress } from '@/hooks/useInputAddress';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToggle } from 'react-use';

import {
  addressEq,
  addressToHex,
  evm2Ss58,
  isEthAddress,
  isPolkadotEvmAddress,
  isValidAddress as isValidAddressUtil,
  useApi
} from '@mimir-wallet/polkadot-core';
import { FreeSoloPopover, Listbox, ListboxItem, usePress } from '@mimir-wallet/ui';

import AddressCell from './AddressCell';
import FormatBalance from './FormatBalance';

function createOptions(
  accounts: AccountData[],
  addresses: { address: string; name: string }[],
  isSign: boolean,
  metas: Record<string, AddressMeta>,
  input?: string,
  filtered?: string[],
  excluded?: string[]
): string[] {
  const all = accounts.reduce<Record<string, string | null | undefined>>((result, item) => {
    result[item.address] = item.name || metas[addressToHex(item.address)]?.name;

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
    options = options.filter((option) => filtered.some((item) => addressEq(item, option[0])));
  }

  if (excluded) {
    options = options.filter((option) => !excluded.some((item) => addressEq(item, option[0])));
  }

  if (!input) return options.map((item) => item[0]);

  const identity = useIdentityStore.getState();

  return options
    .map(([address, name]) => [address, name, identity[addressToHex(address)]] as const)
    .filter(([address, name, identity]) => {
      return (
        address.toLowerCase().includes(input.toLowerCase()) ||
        (name ? name.toLowerCase().includes(input.toLowerCase()) : false) ||
        (identity ? identity.toLowerCase().includes(input.toLowerCase()) : false)
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
  const {
    chainSS58,
    chain: { polkavm }
  } = useApi();
  const { accounts, addresses, isLocalAccount, isLocalAddress, addAddressBook, metas } = useAccount();
  const [value, setValue] = useState<string>(
    isValidAddressUtil(propsValue || defaultValue, polkavm) ? propsValue || defaultValue || '' : ''
  );
  // const [inputValue, setInputValue] = useState<string>('');
  const [[inputValue, isValidAddress], setInputValue] = useInputAddress(undefined, polkavm);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useToggle(false);
  const [isFocused, setIsFocused] = useState(false);
  const upSm = useMediaQuery('sm');

  const options = useMemo((): string[] => {
    const list = sortAccounts(createOptions(accounts, addresses, isSign, metas, inputValue, filtered, excluded), metas);

    if (list.length === 0 && isValidAddressUtil(inputValue, polkavm)) {
      list.push(isEthAddress(inputValue) ? evm2Ss58(inputValue, chainSS58) : inputValue);
    }

    return list;
  }, [accounts, addresses, chainSS58, excluded, filtered, inputValue, isSign, metas, polkavm]);

  useEffect(() => {
    if (isControl.current && propsValue) {
      setValue(propsValue);
    }
  }, [propsValue]);

  useEffect(() => {
    const key = value || '';

    if (isValidAddressUtil(key, polkavm)) {
      onChange?.(isEthAddress(key) ? evm2Ss58(key, chainSS58) : key);
    } else if (key === '') {
      onChange?.('');
    }
  }, [value, onChange, polkavm, chainSS58]);

  const handleSelect = (item: string) => {
    if (item && isValidAddressUtil(item, polkavm)) {
      setValue(isEthAddress(item) ? evm2Ss58(item, chainSS58) : item);
    }

    setInputValue('');
    toggleOpen(false);
  };

  const handleOpen = () => {
    toggleOpen(true);
  };

  const handleClose = () => {
    toggleOpen(false);

    if (!isSign && isValidAddress) {
      if (isEthAddress(inputValue)) {
        handleSelect(evm2Ss58(inputValue, chainSS58));
      } else {
        handleSelect(inputValue);
      }
    } else if (!isSign) {
      setValue('');
    }
  };

  const { pressProps } = usePress({
    onPress: isOpen ? handleClose : handleOpen
  });

  const { pressProps: addAddressBookPressProps } = usePress({
    onPress: () => {
      addAddressBook(value);
    }
  });

  const element = (
    <div
      data-hide={isOpen && isFocused}
      className='address-cell inline-flex items-center gap-x-2.5 flex-grow-0 [&[data-hide=true]_.AddressCell-Content]:hidden w-[calc(100%-20px)]'
    >
      <AddressCell iconSize={iconSize} value={value} shorten={shorten ?? (upSm ? false : true)} />
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
      classNames={{ content: 'rounded-medium border-1 border-divider-300 p-1' }}
    >
      <Listbox color='secondary' emptyContent='no addresses' className='max-h-[250px] overflow-y-auto text-foreground'>
        {options.map((item) => (
          <ListboxItem
            key={item}
            onPress={() => handleSelect(item)}
            className='text-foreground data-[hover=true]:text-foreground'
          >
            <AddressCell addressCopyDisabled withCopy value={item} shorten={upSm ? shorten : true} />
          </ListboxItem>
        ))}
      </Listbox>
    </FreeSoloPopover>
  ) : null;

  const valueIsPolkadotEvmAddress = useMemo(() => isPolkadotEvmAddress(value), [value]);

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
          data-error={!isValidAddress && !!inputValue}
          className='InputAddressContent overflow-hidden relative w-full inline-flex tap-highlight-transparent px-2 border-medium min-h-10 rounded-medium flex-col items-start justify-center gap-0 transition-all !duration-150 motion-reduce:transition-none h-14 py-2 shadow-none border-divider-300 data-[error=true]:border-danger hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary data-[focus=true]:bg-transparent'
        >
          {element}
          <input
            ref={inputRef}
            className='absolute rounded-medium top-0 right-0 bottom-0 left-0 outline-none border-none pl-12 bg-transparent'
            style={{ opacity: (isFocused && isOpen) || !value ? 1 : 0 }}
            value={inputValue}
            placeholder={placeholder}
            onChange={setInputValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...pressProps}
          />

          <ArrowDown
            data-open={isOpen}
            className='cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 data-[open=true]:rotate-180 transition-transform duration-150'
            style={{ color: 'inherit' }}
            {...pressProps}
          />
        </div>
        {!isValidAddress && !!inputValue && <div className='text-small mt-1 text-danger'>Invalid address</div>}

        {valueIsPolkadotEvmAddress ? (
          <div className='text-small mt-1'>🥚✨ Yep, ETH address transfers work — magic, right? 😎</div>
        ) : (
          value &&
          !isLocalAccount(value) &&
          !isLocalAddress(value) && (
            <div className='flex items-center gap-1 text-small mt-1'>
              <IconWarning className='text-warning' />
              This is an unknown address. You can&nbsp;
              <span className='cursor-pointer text-primary' {...addAddressBookPressProps}>
                add it to your address book
              </span>
            </div>
          )
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
