// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';
import type { InputAddressProps } from './types';

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
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
  isValidAddress as isValidAddressUtil,
  useApi,
  useNetworks
} from '@mimir-wallet/polkadot-core';
import { Avatar, Chip, FreeSoloPopover, Listbox, ListboxItem, usePress } from '@mimir-wallet/ui';

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
  const { networks } = useNetworks();
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
  const { meta: { isMultisig, isProxied, isPure, pureCreatedAt } = {} } = useAddressMeta(value);

  const pureNetwork = isPure && pureCreatedAt && networks.find((network) => network.genesisHash === pureCreatedAt);

  const options = useMemo(
    (): string[] => sortAccounts(createOptions(accounts, addresses, isSign, inputValue, filtered, excluded), metas),
    [accounts, addresses, excluded, filtered, inputValue, isSign, metas]
  );

  useEffect(() => {
    if (isControl.current && propsValue) {
      setValue(propsValue);
    }
  }, [propsValue]);

  useEffect(() => {
    const key = value || '';

    if (isValidAddressUtil(key, polkavm)) {
      onChange?.(isEthAddress(key) ? evm2Ss58(key, chainSS58) : key);
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
        console.log('evm2Ss58', evm2Ss58(inputValue, chainSS58));
        handleSelect(evm2Ss58(inputValue, chainSS58));
      } else {
        handleSelect(inputValue);
      }
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
    <div className='address-cell inline-flex items-center gap-x-2.5 flex-grow-0'>
      {value ? (
        <IdentityIcon size={iconSize} value={value} />
      ) : (
        <Avatar style={{ width: iconSize, height: iconSize }} />
      )}
      {isOpen && isFocused ? null : value ? (
        <div className='address-cell-content flex flex-col gap-y-1'>
          <div className='inline-flex items-center gap-1 font-bold text-sm leading-[16px] h-[16px] max-h-[16px] truncate'>
            <AddressName value={value} />
            {isMultisig && (
              <Chip color='secondary' size='sm'>
                Multisig
              </Chip>
            )}
            {(isPure || isProxied) && (
              <Chip color='default' className='bg-[#B700FF]/5 text-[#B700FF]' size='sm'>
                {isPure ? 'Pure' : 'Proxied'}
              </Chip>
            )}
          </div>
          <div className='inline-flex items-center gap-1 text-tiny leading-[14px] h-[14px] max-h-[14px] font-normal'>
            {pureNetwork?.icon ? (
              <Avatar style={{ marginRight: 4 }} src={pureNetwork.icon} className='w-3 h-3' />
            ) : null}
            <span className='text-foreground/50'>
              <Address value={value} shorten={shorten ?? (upSm ? false : true)} />
            </span>
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
          className='InputAddressContent overflow-hidden group relative w-full inline-flex tap-highlight-transparent px-2 border-medium min-h-10 rounded-medium flex-col items-start justify-center gap-0 transition-all !duration-150 motion-reduce:transition-none h-14 py-2 shadow-none border-divider-300 hover:border-primary hover:bg-primary-50 data-[focus=true]:border-primary data-[focus=true]:bg-transparent'
        >
          {element}
          <input
            ref={inputRef}
            className='absolute rounded-medium top-0 right-0 bottom-0 left-0 outline-none border-none pl-12 bg-transparent'
            style={{ opacity: isFocused && isOpen ? 1 : 0 }}
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

        {value && !isLocalAccount(value) && !isLocalAddress(value) && (
          <span className='flex items-center gap-1 text-small'>
            <IconWarning className='text-warning' />
            This is an unknown address. You can&nbsp;
            <span className='cursor-pointer text-primary' {...addAddressBookPressProps}>
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
