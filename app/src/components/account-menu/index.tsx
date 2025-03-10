// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { groupAccounts, type GroupName } from '@/accounts/utils';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconExtension from '@/assets/svg/icon-extension.svg?react';
import IconGlobal from '@/assets/svg/icon-global.svg?react';
import IconUnion from '@/assets/svg/icon-union.svg?react';
import IconUser from '@/assets/svg/icon-user.svg?react';
import IconWatch from '@/assets/svg/icon-watch.svg?react';
import { addressEq, service } from '@/utils';
import { useMediaQuery, useTheme } from '@mui/material';
import { isAddress } from '@polkadot/util-crypto';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Divider, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from '@mimir-wallet/ui';

import AccountCell from './AccountCell';
import CreateMultisig from './CreateMultisig';
import Search from './Search';

interface Props {
  open: boolean;
  anchor?: 'left' | 'right';
  onClose?: () => void;
}

function filterAddress(keywords: string) {
  return (account: AccountData): boolean =>
    keywords
      ? account.address.toLowerCase().includes(keywords.toLowerCase()) ||
        (account.name ? account.name.toLowerCase().includes(keywords.toLowerCase()) : false)
      : true;
}

function AccountMenu({ anchor = 'left', onClose, open }: Props) {
  const [keywords, setKeywords] = useState('');
  const { current, setCurrent, addresses, addAddressBook, accounts, hideAccountHex } = useAccount();
  const [isSearching, setIsSearching] = useState(false);
  const [searchAccount, setSearchAccount] = useState<AccountData>();
  const [grouped, setGrouped] = useState<Record<GroupName, string[]>>(groupAccounts(accounts, hideAccountHex));
  const { breakpoints } = useTheme();
  const downMd = useMediaQuery(breakpoints.down('md'));

  useEffect(() => {
    if (!keywords) {
      setSearchAccount(undefined);
      setGrouped(groupAccounts(accounts, hideAccountHex));

      return;
    }

    if (isAddress(keywords)) {
      setGrouped(
        groupAccounts(
          accounts.filter((account) => addressEq(account.address, keywords)),
          hideAccountHex
        )
      );
      setIsSearching(true);
      service
        .getAccount(keywords)
        .then((data) => {
          setSearchAccount(data);
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      setSearchAccount(undefined);
      setGrouped(groupAccounts(accounts.filter(filterAddress(keywords)), hideAccountHex));
    }
  }, [accounts, hideAccountHex, keywords]);

  const onSelect = useCallback(
    (address: string) => {
      if (current === address) return;

      setCurrent(address);

      onClose?.();
    },
    [onClose, current, setCurrent]
  );

  const watchlist = useMemo(() => addresses.filter(({ watchlist }) => !!watchlist), [addresses]);

  return (
    <Drawer
      hideCloseButton={!downMd}
      radius={downMd ? 'lg' : 'none'}
      onClose={onClose}
      isOpen={open}
      placement={anchor}
      size='sm'
      classNames={{ footer: 'px-2.5 py-2.5' }}
    >
      <DrawerContent className='max-w-[320px] sm:max-w-[400px]'>
        <DrawerHeader className='flex-col'>
          <h3 className='flex sm:none justify-between items-center mb-2.5'>Menu</h3>

          <Search onChange={setKeywords} isSearching={isSearching} value={keywords} />
        </DrawerHeader>

        <DrawerBody className='scrollbar-hide'>
          <div className='space-y-2.5 w-full text-tiny sm:text-small'>
            {searchAccount && (
              <>
                <div className='flex-1 flex items-center gap-1'>
                  <IconGlobal className='opacity-60' />
                  Searched Account
                </div>

                <AccountCell
                  key={`searched-${searchAccount.address}`}
                  onClose={onClose}
                  onSelect={onSelect}
                  value={searchAccount.address}
                  withAdd
                />

                <Divider />
              </>
            )}

            {current && (
              <>
                <div className='flex items-center gap-1'>
                  <IconUser className='opacity-60' />
                  Current Account
                </div>

                <AccountCell key={`current-${current}`} onClose={onClose} value={current} selected />

                <Divider />
              </>
            )}

            {grouped.mimir.length > 0 && (
              <>
                <div className='flex items-center gap-1'>
                  <IconUnion className='opacity-60' />
                  Mimir Wallet
                </div>
                {grouped.mimir.map((account) => (
                  <AccountCell
                    key={`multisig-${account}`}
                    onClose={onClose}
                    onSelect={onSelect}
                    value={account}
                    selected={account === current}
                  />
                ))}

                <Divider />
              </>
            )}

            {grouped.injected.length > 0 && (
              <>
                <div className='flex items-center gap-1'>
                  <IconExtension className='opacity-60' />
                  Extension Wallet
                </div>
                {grouped.injected.map((account) => (
                  <AccountCell key={`extension-${account}`} onClose={onClose} onSelect={onSelect} value={account} />
                ))}

                <Divider />
              </>
            )}

            <div className='flex items-center gap-1'>
              <span className='flex-1 flex items-center gap-1'>
                <IconWatch className='opacity-60' />
                Watchlist
              </span>
              <Button
                isIconOnly
                color='default'
                size='sm'
                variant='light'
                onPress={() => addAddressBook(undefined, true)}
              >
                <IconAdd />
              </Button>
            </div>

            {watchlist.map(({ address }) => (
              <AccountCell
                key={`extension-${address}`}
                watchlist
                onClose={onClose}
                onSelect={onSelect}
                value={address}
              />
            ))}

            {grouped.hide.length > 0 && (
              <>
                <Divider />

                <div className='flex items-center gap-1'>Hidden Accounts</div>

                {grouped.hide.map((account) => (
                  <AccountCell
                    isHide
                    key={`hide-account-${account}`}
                    onClose={onClose}
                    onSelect={onSelect}
                    value={account}
                  />
                ))}
              </>
            )}
          </div>
        </DrawerBody>

        <DrawerFooter>
          <CreateMultisig onClose={onClose} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default React.memo(AccountMenu);
