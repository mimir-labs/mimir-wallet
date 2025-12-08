// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@mimir-wallet/ui';
import React from 'react';

import { useAccount } from '@/accounts/useAccount';

interface AddAddressProps {
  isWatchlist?: boolean;
}

function AddAddress({ isWatchlist = false }: AddAddressProps) {
  const { addAddressBook } = useAccount();

  return (
    <Button
      onClick={() => addAddressBook(undefined, isWatchlist)}
      variant="ghost"
    >
      {isWatchlist ? 'Add Watchlist Address' : 'Add New Contact'}
    </Button>
  );
}

export default React.memo(AddAddress);
