// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@/hooks/types';
import type { HexString } from '@polkadot/util/types';

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import IconSearch from '@/assets/svg/icon-search.svg?react';
import { AddressRow, Empty, Input } from '@/components';
import { useIdentityStore } from '@/hooks/useDeriveAccountInfo';
import React, { useCallback, useMemo, useState } from 'react';

import { addressEq, addressToHex, isPolkadotAddress, zeroAddress } from '@mimir-wallet/polkadot-core';
import { Button, Tooltip, usePress } from '@mimir-wallet/ui';

interface Props {
  withSearch?: boolean;
  title: string;
  type: 'add' | 'delete';
  accounts: string[];
  ignoreAccounts?: string[];
  scroll?: boolean;
  onClick: (value: string) => void;
}

function filterAccounts(signatories: string[], metas: Record<HexString, AddressMeta>, input: string) {
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
      (meta?.name ? meta.name.toLowerCase().includes(input.toLowerCase()) : false) ||
      (identity ? identity.toLowerCase().includes(input.toLowerCase()) : false)
    );
  });
}

function filterIgnoreAccounts(accounts: string[], ignoreAccounts: string[]) {
  if (ignoreAccounts.length === 0) {
    return accounts;
  }

  return accounts.filter((account) => !ignoreAccounts.some((value) => addressEq(value, account)));
}

function Item({
  account,
  disabled,
  type,
  onClick
}: {
  account: string;
  disabled?: boolean;
  type: 'add' | 'delete';
  onClick: (value: string) => void;
}) {
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const { pressProps } = usePress({
    onPress: () => onClick(account)
  });

  const _handleAdd = useCallback(() => {
    if (!(isLocalAddress(account) || isLocalAccount(account))) {
      addAddressBook(account, false);
    }
  }, [account, addAddressBook, isLocalAccount, isLocalAddress]);

  return (
    <div
      className='rounded-small bg-secondary flex cursor-pointer snap-start items-center justify-between p-1'
      {...pressProps}
    >
      <div>
        <Tooltip content={account}>
          <AddressRow iconSize={24} value={account} />
        </Tooltip>
      </div>
      <div className='flex-1' />
      {addressEq(zeroAddress, account) && (
        <Tooltip
          classNames={{ content: 'max-w-[500px] break-all' }}
          content='The SS58 address for 0x0000000000000000000000000000000000000000000000000000000000000000 which cannot be controlled.'
        >
          <IconQuestion />
        </Tooltip>
      )}
      <Button
        isIconOnly
        isDisabled={disabled}
        variant='light'
        color={type === 'add' ? 'primary' : 'danger'}
        onPress={() => {
          _handleAdd();
          onClick(account);
        }}
        size='sm'
        className='h-[26px] min-h-[0px] w-[26px] min-w-[0px]'
      >
        {type === 'add' ? <IconAdd className='h-4 w-4' /> : <IconDelete className='h-4 w-4' />}
      </Button>
    </div>
  );
}

function AccountSelect({ withSearch, accounts, ignoreAccounts = [], onClick, title, type, scroll = true }: Props) {
  const { metas } = useAccount();
  const [keywords, setKeywords] = useState('');

  const filtered = useMemo(
    () => filterIgnoreAccounts(filterAccounts(accounts, metas, keywords), ignoreAccounts),
    [accounts, ignoreAccounts, keywords, metas]
  );

  const handleSelect = useCallback(
    (value: string) => {
      onClick(value);
      setKeywords('');
    },
    [onClick]
  );

  return (
    <div className='flex flex-1 flex-col gap-3'>
      <b>{title}</b>

      <div className='border-divider-300 rounded-medium bg-content1 relative mt-1 flex-1 space-y-2.5 overflow-y-auto border-1 p-2.5'>
        {withSearch && (
          <Input
            className='bg-content1 sticky top-0 z-10'
            endAdornment={<IconSearch />}
            onChange={setKeywords}
            placeholder='search or input address'
            value={keywords}
          />
        )}

        <div
          style={{
            maxHeight: scroll ? '200px' : 'none'
          }}
          className='-mx-1.5 snap-y scroll-pt-2 space-y-2.5 overflow-y-auto scroll-smooth px-1.5 focus:scroll-auto'
        >
          {filtered.map((account, index) => (
            <Item key={index} account={account} type={type} onClick={handleSelect} />
          ))}
          {filtered.length === 0 && <Empty height={160} label='empty' />}
        </div>
      </div>
    </div>
  );
}

export default React.memo(AccountSelect);
