// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';

import { useAccount } from '@mimir-wallet/hooks';

import AddAddress from './AddAddress';
import AddressItem from './AddressItem';

function PageAddressBook() {
  const { addresses } = useAccount();

  return (
    <>
      <AddAddress />
      <Stack marginTop={2} spacing={2}>
        {addresses.map((address) => {
          return <AddressItem address={address.address} key={address.address} />;
        })}
      </Stack>
    </>
  );
}

export default PageAddressBook;
