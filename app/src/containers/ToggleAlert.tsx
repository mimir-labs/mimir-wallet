// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconClose from '@/assets/svg/icon-close.svg?react';
import IconInfo from '@/assets/svg/icon-info-fill.svg?react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@mimir-wallet/ui';

function ToggleAlert({ address, setAlertOpen }: { address: string; setAlertOpen: (state: boolean) => void }) {
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [forceHide, setForceHide] = useState(false);

  const hasThisAccount = useMemo(
    () => isLocalAccount(address) || isLocalAddress(address, true),
    [address, isLocalAccount, isLocalAddress]
  );

  const alertOpen = !forceHide && !hasThisAccount;

  useEffect(() => {
    setAlertOpen(alertOpen);
  }, [alertOpen, setAlertOpen]);

  return alertOpen ? (
    <>
      <div
        onClick={
          hasThisAccount
            ? undefined
            : () => {
                addAddressBook(address, true);
              }
        }
        className='z-50 cursor-pointer sticky top-[56px] w-full pl-2.5 sm:pl-5 py-1 flex items-center h-[38px] gap-1 sm:gap-2.5 bg-primary text-primary-foreground'
      >
        <IconInfo className='w-4 h-4' />

        {!hasThisAccount && (
          <p className='flex-1'>
            You are not a member of this account, currently in Watch-only mode.
            <span className='cursor-pointer hover:underline'>{'Add to watch list>>'}</span>
          </p>
        )}

        <Button
          isIconOnly
          color='default'
          size='sm'
          variant='light'
          onPress={() => {
            setForceHide(true);
          }}
        >
          <IconClose className='w-4 h-4' />
        </Button>
      </div>
    </>
  ) : null;
}

export default ToggleAlert;
