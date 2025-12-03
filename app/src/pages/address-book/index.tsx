// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Tab, Tabs, Tooltip } from '@mimir-wallet/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTransition } from 'react';

import AddAddress from './AddAddress';
import AddressItem from './AddressItem';
import Export from './Export';
import Import from './Import';

import { useAccount } from '@/accounts/useAccount';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { Empty } from '@/components';

function PageAddressBook() {
  const { addresses } = useAccount();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tab?: 'contacts' | 'watchlist' };
  const selectedTab = search.tab || 'contacts';

  const [, startTransition] = useTransition();

  const contactAddresses = addresses.filter((address) => !address.watchlist);
  const watchlistAddresses = addresses.filter((address) => address.watchlist);

  const handleTabChange = (key: React.Key) => {
    // Wrap tab navigation in transition for smooth switching
    startTransition(() => {
      navigate({
        search: ((prev: any) => ({ ...prev, tab: key.toString() })) as any,
        replace: true
      });
    });
  };

  return (
    <>
      <Tabs color='primary' aria-label='Address Book' selectedKey={selectedTab} onSelectionChange={handleTabChange}>
        <Tab key='contacts' title='Contacts' />
        <Tab
          key='watchlist'
          title={
            <div className='flex items-center gap-1'>
              <span>Watchlist</span>
              <Tooltip content='You can view watchlist in account side bar'>
                <IconQuestion className='h-4 w-4 opacity-70' />
              </Tooltip>
            </div>
          }
        />
      </Tabs>

      <div className='mt-5 flex justify-between gap-2.5'>
        <AddAddress isWatchlist={selectedTab === 'watchlist'} />
        <div className='flex-1' />
        <Import />
        <Export />
      </div>

      <div className='mt-5 space-y-5'>
        {selectedTab === 'contacts' ? (
          contactAddresses.length > 0 ? (
            contactAddresses.map((address) => {
              return <AddressItem address={address.address} key={address.address} />;
            })
          ) : (
            <Empty height='80dvh' label='no contacts' />
          )
        ) : watchlistAddresses.length > 0 ? (
          watchlistAddresses.map((address) => {
            return <AddressItem address={address.address} key={address.address} />;
          })
        ) : (
          <Empty height='80dvh' label='no watchlist addresses' />
        )}
      </div>
    </>
  );
}

export default PageAddressBook;
