// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import React from 'react';

import { Button } from '@mimir-wallet/ui';

function AddAddress() {
  const { addAddressBook } = useAccount();

  return (
    <Button onClick={() => addAddressBook()} variant='ghost'>
      Add New Contact
    </Button>
  );
}

export default React.memo(AddAddress);
