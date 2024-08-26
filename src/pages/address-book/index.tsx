// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';

import { useAddresses } from '@mimir-wallet/hooks';

import AddAddress from './AddAddress';
import AddressItem from './AddressItem';

function PageAddressBook() {
  const { allAddresses } = useAddresses();

  return (
    <>
      <AddAddress />
      <Stack marginTop={2} spacing={2}>
        {allAddresses.map((address) => {
          return <AddressItem address={address} key={address} />;
        })}
      </Stack>
    </>
  );
}

export default PageAddressBook;
