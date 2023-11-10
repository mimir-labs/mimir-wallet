// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Grid from '@mui/material/Unstable_Grid2';

import { useAddresses } from '@mimirdev/hooks';

import AddAddress from './AddAddress';
import AddressCell from './AddressCell';

function PageAddressBook() {
  const { allAddresses } = useAddresses();

  return (
    <>
      <AddAddress />
      <Grid columns={{ xs: 12 }} container marginTop={2.5} spacing={2.5}>
        {allAddresses.map((address, index) => {
          return (
            <Grid key={index} lg={6} md={12} xs={12}>
              <AddressCell address={address} />
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}

export default PageAddressBook;
