// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { AddressCell } from '@/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWallet } from '@/wallet/useWallet';
import { useMemo } from 'react';

import { addressEq, addressToHex } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

function AccountDisplay() {
  const { accounts, hideAccountHex, hideAccount, showAccount } = useAccount();
  const { walletAccounts } = useWallet();
  const upSm = useMediaQuery('sm');

  const list = useMemo(() => {
    // sort by hideAccountHex
    return accounts
      .sort((a) => {
        return hideAccountHex.includes(addressToHex(a.address)) ? -1 : 1;
      })
      .filter((a) => !walletAccounts.some((w) => addressEq(w.address, a.address)));
  }, [accounts, hideAccountHex, walletAccounts]);

  return (
    <div className='bg-content1 border-secondary shadow-medium flex flex-col gap-5 rounded-[20px] border-1 p-5'>
      {list.map((item) => {
        const isHide = hideAccountHex.includes(addressToHex(item.address));

        return (
          <div className='flex items-center justify-between'>
            <AddressCell shorten={!upSm} value={item.address} />
            <Button variant='ghost' onClick={() => (isHide ? showAccount(item.address) : hideAccount(item.address))}>
              {isHide ? 'Unhide' : 'Hide'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default AccountDisplay;
