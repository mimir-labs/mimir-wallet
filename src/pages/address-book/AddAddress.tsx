// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AddAddressDialog } from '@mimir-wallet/components';
import { useToggle } from '@mimir-wallet/hooks';
import { Button } from '@mui/material';
import React from 'react';

function AddAddress() {
  const [open, toggleOpen] = useToggle();

  return (
    <>
      <Button onClick={toggleOpen} variant='outlined'>
        Add New Contact
      </Button>
      <AddAddressDialog onClose={toggleOpen} open={open} />
    </>
  );
}

export default React.memo(AddAddress);
