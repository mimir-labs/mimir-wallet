// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@mui/material';
import React from 'react';

import { useAccount } from '@mimir-wallet/accounts/useAccount';

function AddAddress() {
  const { addAddressBook } = useAccount();

  return (
    <Button onClick={() => addAddressBook()} variant='outlined'>
      Add New Contact
    </Button>
  );
}

export default React.memo(AddAddress);
