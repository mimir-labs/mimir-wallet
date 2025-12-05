// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { addressEq, addressToHex } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';
import { useMemo } from 'react';

import { useAccount } from '@/accounts/useAccount';
import { AddressCell } from '@/components';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWallet } from '@/wallet/useWallet';

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
    <div className='bg-background border-secondary flex flex-col gap-5 rounded-[20px] border-1 p-5 shadow-md'>
      {list.map((item) => {
        const isHide = hideAccountHex.includes(addressToHex(item.address));

        return (
          <div className='flex items-center justify-between' key={item.address}>
            <AddressCell showNetworkProxied withIconBorder shorten={!upSm} value={item.address} />
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
