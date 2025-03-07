// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { Button } from '@mui/material';
import React from 'react';

function AddAddress() {
  const { addAddressBook } = useAccount();

  return (
    <Button onClick={() => addAddressBook()} variant='outlined'>
      Add New Contact
    </Button>
  );
}

export default React.memo(AddAddress);
