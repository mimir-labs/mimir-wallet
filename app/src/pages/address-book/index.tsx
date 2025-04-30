// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { Empty } from '@/components';

import AddAddress from './AddAddress';
import AddressItem from './AddressItem';
import Export from './Export';
import Import from './Import';

function PageAddressBook() {
  const { addresses } = useAccount();

  return (
    <>
      <div className='flex justify-between gap-2.5'>
        <AddAddress />
        <div className='flex-1' />
        <Import />
        <Export />
      </div>
      <div className='mt-5 space-y-5'>
        {addresses.length > 0 ? (
          addresses.map((address) => {
            return <AddressItem address={address.address} key={address.address} />;
          })
        ) : (
          <Empty height='80dvh' label='no address book' />
        )}
      </div>
    </>
  );
}

export default PageAddressBook;
