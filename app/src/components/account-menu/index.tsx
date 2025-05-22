// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountData, AddressMeta } from '@/hooks/types';

import { useAccount } from '@/accounts/useAccount';
import { groupAccounts, type GroupName } from '@/accounts/utils';
import ArrowDownIcon from '@/assets/svg/ArrowDown.svg?react';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconExtension from '@/assets/svg/icon-extension.svg?react';
import IconGlobal from '@/assets/svg/icon-global.svg?react';
import IconPin from '@/assets/svg/icon-pin.svg?react';
import IconUnion from '@/assets/svg/icon-union.svg?react';
import IconUser from '@/assets/svg/icon-user.svg?react';
import IconWatch from '@/assets/svg/icon-watch.svg?react';
import { useIdentityStore } from '@/hooks/useDeriveAccountInfo';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePinAccounts } from '@/hooks/usePinAccounts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { addressEq, addressToHex, encodeAddress, isPolkadotAddress, useApi } from '@mimir-wallet/polkadot-core';
import { service } from '@mimir-wallet/service';
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  usePress
} from '@mimir-wallet/ui';

import AccountCell from './AccountCell';
import CreateMultisig from './CreateMultisig';
import Search from './Search';

interface Props {
  open: boolean;
  anchor?: 'left' | 'right';
  onClose?: () => void;
}

function filterKeywords(address: string, keywords: string, metas: Record<string, AddressMeta>) {
  const addressHex = addressToHex(address);

  const meta = metas[addressHex];
  const identity = useIdentityStore.getState()[addressHex];

  return (
    address.toLowerCase().includes(keywords.toLowerCase()) ||
    (meta?.name ? meta?.name.toLowerCase().includes(keywords.toLowerCase()) : false) ||
    (identity ? identity.toLowerCase().includes(keywords.toLowerCase()) : false)
  );
}

function AccountMenu({ anchor = 'left', onClose, open }: Props) {
  const [keywords, setKeywords] = useState<string>('');
  const { chainSS58 } = useApi();
  const { current, setCurrent, addresses, addAddressBook, accounts, hideAccountHex, metas } = useAccount();
  const [isSearching, setIsSearching] = useState(false);
  const [searchAccount, setSearchAccount] = useState<AccountData>();
  const [isMimirExpanded, setIsMimirExpanded] = useState(true);
  const { pinnedAccounts } = usePinAccounts();
  const visiblePinnedAccounts = useMemo(() => {
    const result = [];

    for (const addressHex of pinnedAccounts) {
      if (hideAccountHex.includes(addressHex)) continue;

      const address = encodeAddress(addressHex, chainSS58);

      if (filterKeywords(address, keywords, metas)) {
        result.push(address);
      }
    }

    return result;
  }, [pinnedAccounts, hideAccountHex, metas, keywords, chainSS58]);

  const keywordsIsPolkadotAddress = !!keywords && isPolkadotAddress(keywords);

  const { pressProps } = usePress({
    onPress: () => setIsMimirExpanded(!isMimirExpanded)
  });

  const [grouped, setGrouped] = useState<Record<GroupName, string[]>>(
    groupAccounts(accounts, hideAccountHex.concat(pinnedAccounts), metas)
  );
  const upMd = useMediaQuery('md');

  useEffect(() => {
    if (!keywords) {
      setSearchAccount(undefined);
      setGrouped(groupAccounts(accounts, hideAccountHex.concat(pinnedAccounts), metas));

      return;
    }

    if (isPolkadotAddress(keywords)) {
      setGrouped(
        groupAccounts(
          accounts.filter((account) => addressEq(account.address, keywords)),
          hideAccountHex.concat(pinnedAccounts),
          metas
        )
      );
      setIsSearching(true);
      service
        .getOmniChainDetails(keywords)
        .then((data) => {
          setSearchAccount(data);
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      setSearchAccount(undefined);
      setGrouped(groupAccounts(accounts, hideAccountHex.concat(pinnedAccounts), metas, keywords));
    }
  }, [accounts, hideAccountHex, keywords, metas, pinnedAccounts]);

  const onSelect = useCallback(
    (address: string) => {
      if (addressEq(current, address)) return;

      setCurrent(address);

      onClose?.();
    },
    [onClose, current, setCurrent]
  );

  const watchlist = useMemo(
    () =>
      addresses.filter(({ watchlist, address }) => {
        if (!watchlist) return false;

        if (pinnedAccounts.includes(addressToHex(address))) return false;

        if (!keywords) return true;

        if (isPolkadotAddress(keywords)) {
          return addressEq(address, keywords);
        }

        return filterKeywords(address, keywords, metas);
      }),
    [addresses, keywords, metas, pinnedAccounts]
  );

  return (
    <Drawer
      hideCloseButton={upMd}
      radius={!upMd ? 'lg' : 'none'}
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

            {current && !keywordsIsPolkadotAddress && (
              <>
                <div className='flex items-center gap-1'>
                  <IconUser className='opacity-60' />
                  Current Wallet
                </div>

                <AccountCell key={`current-${current}`} onClose={onClose} value={current} selected />

                <Divider />
              </>
            )}

            {visiblePinnedAccounts.length > 0 && (
              <>
                <div className='flex items-center gap-1'>
                  <IconPin className='opacity-60 w-4 h-4' />
                  Pinned Wallet
                </div>

                {visiblePinnedAccounts.map((account) => (
                  <AccountCell
                    key={`pinned-${account}`}
                    onClose={onClose}
                    onSelect={onSelect}
                    value={account}
                    selected={addressEq(account, current)}
                  />
                ))}
              </>
            )}

            {grouped.mimir.length > 0 && (
              <>
                <div className='cursor-pointer flex items-center gap-1' {...pressProps}>
                  <IconUnion className='opacity-60' />
                  <span className='flex-1'>Mimir Wallet</span>
                  <Button
                    isIconOnly
                    color='default'
                    size='sm'
                    variant='light'
                    data-expanded={isMimirExpanded}
                    className='data-[expanded=true]:rotate-180'
                    onPress={() => setIsMimirExpanded(!isMimirExpanded)}
                  >
                    <ArrowDownIcon />
                  </Button>
                </div>
                {isMimirExpanded
                  ? grouped.mimir.map((account) => (
                      <AccountCell
                        key={`multisig-${account}`}
                        onClose={onClose}
                        onSelect={onSelect}
                        value={account}
                        selected={addressEq(account, current)}
                      />
                    ))
                  : null}

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

            {!keywordsIsPolkadotAddress && (
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
            )}

            {!keywordsIsPolkadotAddress &&
              watchlist.map(({ address }) => (
                <AccountCell
                  key={`extension-${address}`}
                  watchlist
                  onClose={onClose}
                  onSelect={onSelect}
                  value={address}
                />
              ))}
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
