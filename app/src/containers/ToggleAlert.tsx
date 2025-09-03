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
        className='text-primary-foreground bg-home-main flex h-[38px] w-full cursor-pointer items-center gap-1 rounded-[5px] py-1 pl-2.5 sm:gap-2.5 sm:pl-5'
      >
        <IconInfo className='h-4 w-4' />

        {!hasThisAccount && (
          <p className='flex-1'>
            You are not a member of this account, currently in Watch-only mode.
            <span className='cursor-pointer hover:underline'>{'Add to watch list>>'}</span>
          </p>
        )}

        <Button
          isIconOnly
          className='text-inherit'
          size='sm'
          variant='light'
          onClick={() => {
            setForceHide(true);
          }}
        >
          <IconClose className='h-4 w-4' />
        </Button>
      </div>
    </>
  ) : null;
}

export default ToggleAlert;
