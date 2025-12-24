// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InputAddressProps } from './types';
import type { AccountData, AddressMeta } from '@/hooks/types';

import {
  addressToHex,
  evm2Ss58,
  isEthAddress,
  isPolkadotAddress,
  isPolkadotEvmAddress,
  isValidAddress as isValidAddressUtil,
  useNetwork,
  useSs58Format,
  zeroAddress,
} from '@mimir-wallet/polkadot-core';
import {
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@mimir-wallet/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useToggle } from 'react-use';

import AddressCell from './AddressCell';
import AddressRow from './AddressRow';

import { useAccount } from '@/accounts/useAccount';
import { sortAccounts } from '@/accounts/utils';
import ArrowDown from '@/assets/svg/ArrowDown.svg?react';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import IconSearch from '@/assets/svg/icon-search.svg?react';
import { useIdentityStore } from '@/hooks/useDeriveAccountInfo';
import { useInputAddress } from '@/hooks/useInputAddress';
import { useMediaQuery } from '@/hooks/useMediaQuery';

function createOptions(
  accounts: AccountData[],
  addresses: { address: string; name: string }[],
  isSign: boolean,
  metas: Record<string, AddressMeta>,
  input?: string,
  filtered?: string[],
  excluded?: string[],
): string[] {
  const list: Set<string> = new Set();
  const identity = useIdentityStore.getState();

  // Pre-compute hex addresses for excluded/filtered for O(1) lookup
  const excludedSet = excluded?.length
    ? new Set(excluded.map((addr) => addressToHex(addr)))
    : null;
  const filteredSet = filtered?.length
    ? new Set(filtered.map((addr) => addressToHex(addr)))
    : null;

  // Pre-compute lowercase input once
  const inputLower = input?.toLowerCase();
  const isAddressInput = input ? isPolkadotAddress(input) : false;
  const inputHex = isAddressInput ? addressToHex(input!) : null;

  // Helper function to check if address matches search criteria
  const matchesSearch = (
    address: string,
    addressHex: string,
    name?: string,
  ): boolean => {
    if (!input) return true;

    if (isAddressInput && inputHex) {
      return addressHex === inputHex;
    }

    const addressLower = address.toLowerCase();
    const nameLower = name?.toLowerCase();
    const identityValue = (identity as Record<string, string>)[
      addressHex
    ]?.toLowerCase();

    return (
      addressLower.includes(inputLower!) ||
      (!!nameLower && nameLower.includes(inputLower!)) ||
      (!!identityValue && identityValue.includes(inputLower!))
    );
  };

  // Process accounts
  for (const item of accounts) {
    const address = item.address;
    const addressHex = addressToHex(address);

    // Early filtering with O(1) Set lookups
    if (excludedSet?.has(addressHex)) continue;
    if (filteredSet && !filteredSet.has(addressHex)) continue;

    // Check search match
    const name = item.name || metas[addressHex]?.name;

    if (!matchesSearch(address, addressHex, name)) continue;

    list.add(addressHex);
  }

  if (!isSign) {
    // Process additional addresses if not in sign mode
    for (const item of addresses) {
      const address = item.address;
      const addressHex = addressToHex(address);

      // Early filtering with O(1) Set lookups
      if (excludedSet?.has(addressHex)) continue;
      if (filteredSet && !filteredSet.has(addressHex)) continue;

      // Check search match
      const name = item.name || metas[addressHex]?.name;

      if (!matchesSearch(address, addressHex, name)) continue;

      list.add(addressHex);
    }
  }

  return Array.from(list);
}

function InputAddress({
  className,
  wrapperClassName,
  iconSize = 30,
  defaultValue,
  disabled,
  filtered,
  excluded,
  isSign = false,
  label,
  onChange,
  onSelect,
  placeholder = 'Select address...',
  searchPlaceholder = 'Search address...',
  shorten = false,
  value: propsValue,
  helper,
  addressType = 'cell',
  rowType = 'both',
  endContent,
  withAddButton,
  withZeroAddress = false,
}: InputAddressProps) {
  const isControl = useRef(propsValue !== undefined);
  const { ss58: chainSS58 } = useSs58Format();
  const { chain } = useNetwork();
  const polkavm = chain.polkavm;
  const {
    accounts,
    addresses,
    isLocalAccount,
    isLocalAddress,
    addAddressBook,
    metas,
  } = useAccount();
  const [value, setValue] = useState<string>(
    isValidAddressUtil(propsValue || defaultValue, polkavm)
      ? propsValue || defaultValue || ''
      : '',
  );
  const [[inputValue], setInputValue] = useInputAddress(undefined, polkavm);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useToggle(false);
  const upSm = useMediaQuery('sm');
  const onChangeRef = useRef(onChange);
  const stateRef = useRef({
    polkavm,
    chainSS58,
  });

  // Memoize options computation to avoid unnecessary recalculations
  const options = useMemo(() => {
    const list = sortAccounts(
      createOptions(
        accounts,
        addresses,
        isSign,
        metas,
        inputValue,
        filtered,
        excluded,
      ),
      metas,
    );

    if (list.length === 0 && isValidAddressUtil(inputValue, polkavm)) {
      list.push(
        isEthAddress(inputValue) ? evm2Ss58(inputValue, chainSS58) : inputValue,
      );
    }

    if (withZeroAddress && !inputValue) {
      list.unshift(zeroAddress);
    }

    return list;
  }, [
    accounts,
    addresses,
    chainSS58,
    excluded,
    filtered,
    inputValue,
    isSign,
    metas,
    polkavm,
    withZeroAddress,
  ]);

  // Set up virtualizer for efficient list rendering
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => (addressType === 'cell' ? 50 : 40), // estimated row height
    overscan: 10, // render 10 extra items above/below viewport
    // Provide initial measurement to prevent empty state on first open
    initialRect: { width: 0, height: 250 },
  });

  // Remeasure when dropdown opens to ensure virtualizer has correct dimensions
  // useLayoutEffect runs synchronously after DOM updates but before browser paint
  useEffect(() => {
    if (isOpen)
      startTransition(() => {
        rowVirtualizer.measure();
      });
  }, [isOpen, rowVirtualizer]);

  onChangeRef.current = onChange;
  stateRef.current = { polkavm, chainSS58 };

  useEffect(() => {
    if (isControl.current) {
      setValue(propsValue || '');
    }
  }, [propsValue]);

  useEffect(() => {
    const key = value || '';

    if (isValidAddressUtil(key, stateRef.current.polkavm)) {
      onChangeRef.current?.(
        isEthAddress(key) ? evm2Ss58(key, stateRef.current.chainSS58) : key,
      );
    } else if (key === '') {
      onChangeRef.current?.('');
    }
  }, [value]);

  const handleSelect = useCallback(
    (item: string) => {
      if (item && isValidAddressUtil(item, polkavm)) {
        const _value = isEthAddress(item) ? evm2Ss58(item, chainSS58) : item;

        setValue(_value);
      }

      setInputValue('');
      toggleOpen(false);
    },
    [chainSS58, polkavm, setInputValue, toggleOpen],
  );

  // Render selected address or placeholder in trigger
  const renderSelectedValue = () => {
    if (value) {
      return (
        <div className="inline-flex w-[calc(100%-20px)] grow-0 items-center gap-x-2.5">
          {addressType === 'cell' ? (
            <AddressCell
              iconSize={iconSize}
              value={value}
              shorten={upSm ? shorten : true}
            />
          ) : (
            <AddressRow
              className="[&_.AddressRow-Address]:text-muted-foreground [&_.AddressRow-Name]:font-normal"
              iconSize={iconSize}
              value={value}
              shorten={upSm ? shorten : true}
              withName={rowType === 'name' || rowType === 'both'}
              withAddress={rowType === 'address' || rowType === 'both'}
            />
          )}
        </div>
      );
    }

    return <span className="text-foreground/50 truncate">{placeholder}</span>;
  };

  const valueIsPolkadotEvmAddress = useMemo(
    () => isPolkadotEvmAddress(value),
    [value],
  );

  return (
    <div
      data-disabled={disabled}
      className={`input-address-wrapper w-full space-y-2 data-[disabled=true]:pointer-events-none ${className || ''}`}
    >
      {label && <div className="text-sm font-bold">{label}</div>}

      <div className="input-address-base flex gap-2.5">
        <Popover open={isOpen} onOpenChange={toggleOpen}>
          <PopoverTrigger asChild>
            <div
              ref={wrapperRef}
              className={cn(
                'input-address-content border-divider hover:border-primary hover:bg-primary-50 relative inline-flex h-14 min-h-10 w-full cursor-pointer items-center overflow-hidden rounded-[10px] border px-2 py-2 shadow-none transition-all duration-150! motion-reduce:transition-none',
                wrapperClassName,
              )}
            >
              {renderSelectedValue()}

              {value && !isLocalAccount(value) && !isLocalAddress(value) ? (
                <Tooltip color="foreground" content="Add to address book">
                  <IconAddressBook
                    className="text-divider hover:text-primary absolute top-1/2 right-8 -translate-y-1/2 cursor-pointer transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addAddressBook(value);
                    }}
                  />
                </Tooltip>
              ) : null}

              <ArrowDown
                data-open={isOpen}
                className="absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer transition-transform duration-150 data-[open=true]:rotate-180"
                style={{ color: 'inherit' }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="border-divider group w-(--radix-popover-trigger-width) min-w-[300px] border p-0"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
          >
            {/* Search input - matching CommandInput style */}
            <div className="flex h-9 items-center gap-2 border-b px-3">
              <IconSearch className="size-4 shrink-0 opacity-50" />
              <input
                ref={inputRef}
                autoFocus
                className="placeholder:text-foreground/50 flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={searchPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>

            {/* Address list */}
            {options.length > 0 ? (
              <div
                ref={scrollContainerRef}
                className="text-foreground group max-h-[300px] overflow-y-auto p-[5px] pr-0 scroll-hover-show"
              >
                <ul
                  className={cn(
                    'relative flex list-none flex-col',
                    addressType === 'cell' ? '' : 'gap-2.5',
                  )}
                  style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const item = options[virtualRow.index];

                    return (
                      <li
                        key={virtualRow.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        onClick={() => {
                          const shouldContinue = onSelect?.(item);

                          if (shouldContinue !== false) {
                            handleSelect(item);
                          } else {
                            setInputValue('');
                            toggleOpen(false);
                          }
                        }}
                        className={cn(
                          'text-foreground transition-background hover:bg-secondary flex cursor-pointer items-center justify-between rounded-[10px] px-2 py-1.5',
                          addressType === 'cell' ? '' : 'bg-secondary p-[5px]',
                        )}
                      >
                        {addressType === 'cell' ? (
                          <AddressCell
                            addressCopyDisabled
                            withCopy
                            value={item}
                            shorten={upSm ? shorten : true}
                          />
                        ) : (
                          <AddressRow
                            className="[&_.AddressRow-Address]:text-muted-foreground [&_.AddressRow-Name]:font-normal"
                            iconSize={iconSize}
                            value={item}
                            shorten={upSm ? shorten : true}
                            withCopy
                            withName
                            withAddress
                          />
                        )}
                        {withAddButton ? (
                          <IconAdd className="text-primary" />
                        ) : undefined}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="text-foreground/50 py-6 text-center text-sm">
                No addresses found
              </div>
            )}
          </PopoverContent>
        </Popover>

        {endContent ? <div>{endContent}</div> : null}
      </div>

      {valueIsPolkadotEvmAddress ? (
        <div className="mt-1 text-sm">
          🥚✨ Yep, ETH address transfers work — magic, right? 😎
        </div>
      ) : null}

      {helper && <div className="text-foreground/50 text-xs">{helper}</div>}
    </div>
  );
}

export default React.memo(InputAddress);
