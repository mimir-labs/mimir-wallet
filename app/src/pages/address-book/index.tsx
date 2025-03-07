// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { Empty } from '@/components';
import { Box, Stack } from '@mui/material';

import AddAddress from './AddAddress';
import AddressItem from './AddressItem';
import Export from './Export';
import Import from './Import';

function PageAddressBook() {
  const { addresses } = useAccount();

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <AddAddress />
        <Box sx={{ flex: '1' }} />
        <Import />
        <Export />
      </Box>
      <Stack marginTop={2} spacing={2}>
        {addresses.length > 0 ? (
          addresses.map((address) => {
            return <AddressItem address={address.address} key={address.address} />;
          })
        ) : (
          <Empty height='80dvh' label='no address book' />
        )}
      </Stack>
    </>
  );
}

export default PageAddressBook;
