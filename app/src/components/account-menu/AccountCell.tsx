// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconMore from '@/assets/svg/icon-more.svg?react';
import { findToken } from '@/config';
import { useApi } from '@/hooks/useApi';
import { useNativeBalances } from '@/hooks/useBalances';
import { useAccountSource } from '@/wallet/useWallet';
import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Avatar, Button, Popover, PopoverContent, PopoverTrigger, Skeleton } from '@mimir-wallet/ui';

import AddressCell from '../AddressCell';
import FormatBalance from '../FormatBalance';

function AccountCell({
  onClose,
  onSelect,
  watchlist,
  selected,
  isHide = false,
  value
}: {
  onClose?: () => void;
  selected?: boolean;
  value?: string;
  watchlist?: boolean;
  isHide?: boolean;
  onSelect?: (address: string) => void;
}) {
  const { genesisHash } = useApi();
  const { isLocalAccount, deleteAddress, showAccount, hideAccount } = useAccount();
  const [balances, isFetched] = useNativeBalances(value);
  const icon = useMemo(() => findToken(genesisHash).Icon, [genesisHash]);
  const source = useAccountSource(value);

  const handleClick = useCallback(() => {
    value && onSelect?.(value);
  }, [onSelect, value]);

  return (
    <Button
      fullWidth
      onPress={handleClick}
      variant='bordered'
      color='secondary'
      size='md'
      data-selected={selected}
      className='justify-between px-1 sm:px-2.5 py-1 text-foreground h-[50px] rounded-medium data-[selected=true]:bg-secondary'
    >
      <AddressCell shorten showType value={value} withCopy withAddressBook />
      {isFetched ? (
        <div className='flex items-center gap-1 text-tiny font-bold'>
          <FormatBalance value={balances?.total} />
          <Avatar classNames={{ base: 'bg-transparent' }} alt='Token' src={icon} className='w-[16px] h-[16px]' />
        </div>
      ) : (
        <Skeleton className='w-[40px]' />
      )}

      {value && (isLocalAccount(value) || watchlist) && (
        <Popover radius='md'>
          <PopoverTrigger>
            <Button isIconOnly size='sm' variant='light' color='default'>
              <IconMore className='w-4 h-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='p-2.5 space-y-2.5 items-stretch'>
            {value &&
              isLocalAccount(value) && [
                source ? null : (
                  <Button
                    key='hide-0'
                    disableRipple
                    radius='sm'
                    variant='light'
                    color='primary'
                    className='justify-start text-foreground'
                    onPress={() => {
                      console.log('hide', isHide);
                      isHide ? showAccount(value) : hideAccount(value);
                    }}
                  >
                    {isHide ? 'Show' : 'Hide'}
                  </Button>
                ),
                <Button
                  key='setting-1'
                  as={Link}
                  disableRipple
                  radius='sm'
                  variant='light'
                  color='primary'
                  className='justify-start text-foreground'
                  onPress={onClose}
                  to={`/account-setting?address=${value}`}
                >
                  Setting
                </Button>
              ]}

            {value && watchlist && (
              <Button
                key='delete-2'
                disableRipple
                radius='sm'
                variant='light'
                color='primary'
                className='justify-start text-foreground'
                onPress={() => deleteAddress(value)}
              >
                Delete
              </Button>
            )}
          </PopoverContent>
        </Popover>
      )}
    </Button>
  );
}

export default React.memo(AccountCell);
