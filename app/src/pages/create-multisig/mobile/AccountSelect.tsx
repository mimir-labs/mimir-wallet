// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import {
  addressEq,
  addressToHex,
  isPolkadotAddress,
  zeroAddress,
} from '@mimir-wallet/polkadot-core';
import { Button, Tooltip } from '@mimir-wallet/ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import IconSearch from '@/assets/svg/icon-search.svg?react';
import { AddressRow, Empty, Input } from '@/components';
import { useIdentityStore } from '@/hooks/useDeriveAccountInfo';

interface Props {
  withSearch?: boolean;
  title: string;
  type: 'add' | 'delete';
  accounts: string[];
  ignoreAccounts?: string[];
  scroll?: boolean;
  onClick: (value: string) => void;
}

const ITEM_HEIGHT = 42; // Item height including gap

function filterAccounts(
  signatories: string[],
  metas: Record<HexString, AddressMeta>,
  input: string,
) {
  if (!input) return signatories;

  if (isPolkadotAddress(input)) {
    const accounts = signatories.filter((address) => addressEq(address, input));

    if (accounts.length === 0) {
      return [input];
    }

    return accounts;
  }

  const identities = useIdentityStore.getState();

  return signatories.filter((address) => {
    const meta = metas[addressToHex(address)];

    const identity = identities[addressToHex(address)];

    return (
      address.toLowerCase().includes(input.toLowerCase()) ||
      (meta?.name
        ? meta.name.toLowerCase().includes(input.toLowerCase())
        : false) ||
      (identity ? identity.toLowerCase().includes(input.toLowerCase()) : false)
    );
  });
}

function filterIgnoreAccounts(accounts: string[], ignoreAccounts: string[]) {
  if (ignoreAccounts.length === 0) {
    return accounts;
  }

  return accounts.filter(
    (account) => !ignoreAccounts.some((value) => addressEq(value, account)),
  );
}

function Item({
  account,
  disabled,
  type,
  onClick,
}: {
  account: string;
  disabled?: boolean;
  type: 'add' | 'delete';
  onClick: (value: string) => void;
}) {
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();

  const _handleAdd = useCallback(() => {
    if (!(isLocalAddress(account) || isLocalAccount(account))) {
      addAddressBook(account, false);
    }
  }, [account, addAddressBook, isLocalAccount, isLocalAddress]);

  return (
    <div
      className="bg-secondary flex cursor-pointer snap-start items-center justify-between rounded-[5px] p-1"
      onClick={(e) => {
        e.stopPropagation();
        onClick(account);
      }}
    >
      <div>
        <Tooltip content={account}>
          <AddressRow iconSize={24} value={account} />
        </Tooltip>
      </div>
      <div className="flex-1" />
      {addressEq(zeroAddress, account) && (
        <Tooltip
          classNames={{ content: 'max-w-[500px] break-all' }}
          content="The SS58 address for 0x0000000000000000000000000000000000000000000000000000000000000000 which cannot be controlled."
        >
          <IconQuestion />
        </Tooltip>
      )}
      <Button
        isIconOnly
        disabled={disabled}
        variant="light"
        color={type === 'add' ? 'primary' : 'danger'}
        onClick={() => {
          _handleAdd();
          onClick(account);
        }}
        size="sm"
        className="h-[26px] min-h-0 w-[26px] min-w-0"
      >
        {type === 'add' ? (
          <IconAdd className="h-4 w-4" />
        ) : (
          <IconDelete className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function AccountSelect({
  withSearch,
  accounts,
  ignoreAccounts = [],
  onClick,
  title,
  type,
  scroll = true,
}: Props) {
  const { metas } = useAccount();
  const [keywords, setKeywords] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      filterIgnoreAccounts(
        filterAccounts(accounts, metas, keywords),
        ignoreAccounts,
      ),
    [accounts, ignoreAccounts, keywords, metas],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  const handleSelect = useCallback(
    (value: string) => {
      onClick(value);
      setKeywords('');
    },
    [onClick],
  );

  return (
    <div className="flex flex-1 flex-col gap-3">
      <b>{title}</b>

      <div className="border-divider bg-background relative mt-1 flex-1 space-y-2.5 overflow-y-auto rounded-[10px] border p-2.5">
        {withSearch && (
          <Input
            className="bg-background sticky top-0 z-10"
            endAdornment={<IconSearch />}
            onChange={setKeywords}
            placeholder="search or input address"
            value={keywords}
          />
        )}

        {filtered.length === 0 ? (
          <Empty height={160} label="empty" />
        ) : (
          <div
            ref={parentRef}
            style={{
              maxHeight: scroll ? '200px' : 'none',
            }}
            className="-mx-1.5 overflow-y-auto px-1.5"
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const account = filtered[virtualItem.index];

                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                      paddingBottom: '10px',
                    }}
                  >
                    <Item
                      account={account}
                      type={type}
                      onClick={handleSelect}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(AccountSelect);
