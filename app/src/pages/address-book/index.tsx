// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { Empty } from '@/components';
import { useState } from 'react';

import { Tab, Tabs } from '@mimir-wallet/ui';

import AddAddress from './AddAddress';
import AddressItem from './AddressItem';
import Export from './Export';
import Import from './Import';

function PageAddressBook() {
  const { addresses } = useAccount();
  const [selectedTab, setSelectedTab] = useState<string>('contacts');

  const contactAddresses = addresses.filter((address) => !address.watchlist);
  const watchlistAddresses = addresses.filter((address) => address.watchlist);

  return (
    <>
      <Tabs
        color='primary'
        aria-label='Address Book'
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key.toString())}
      >
        <Tab key='contacts' title='Contacts' />
        <Tab key='watchlist' title='Watchlist' />
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
