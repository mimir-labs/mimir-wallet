// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconMore from '@/assets/svg/icon-more.svg?react';
import { useBalanceTotalUsd } from '@/hooks/useBalances';
import { usePinAccounts } from '@/hooks/usePinAccounts';
import { formatDisplay } from '@/utils';
import { useAccountSource } from '@/wallet/useWallet';
import React, { useCallback, useMemo } from 'react';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { Button, Link, Popover, PopoverContent, PopoverTrigger } from '@mimir-wallet/ui';

import AddressCell from '../AddressCell';

function AccountCell({
  onClose,
  onSelect,
  watchlist,
  selected,
  withAdd = false,
  value
}: {
  onClose?: () => void;
  selected?: boolean;
  value: string;
  withAdd?: boolean;
  watchlist?: boolean;
  onSelect?: (address: string) => void;
}) {
  const { isLocalAccount, deleteAddress, hideAccount, addAddressBook } = useAccount();
  const [totalUsd] = useBalanceTotalUsd(value);
  const source = useAccountSource(value);
  const formatUsd = formatDisplay(totalUsd.toString());
  const { pinnedAccounts, addPinnedAccount, removePinnedAccount } = usePinAccounts();

  const isPinned = useMemo(() => pinnedAccounts.includes(addressToHex(value)), [pinnedAccounts, value]);

  const handleClick = useCallback(() => {
    onSelect?.(value);
  }, [onSelect, value]);

  const isLocal = isLocalAccount(value);

  return (
    <Button
      fullWidth
      onPress={handleClick}
      variant='bordered'
      color='secondary'
      size='md'
      data-selected={selected}
      className='text-foreground rounded-medium data-[selected=true]:bg-secondary h-[50px] justify-between px-1 py-1 sm:px-2.5'
    >
      <AddressCell
        className='min-w-0 flex-1'
        withIconBorder
        shorten
        showType
        value={value}
        withCopy
        withAddressBook
        addressCopyDisabled
        showNetworkProxied
        withPendingTxCounts
      />
      <div className='text-tiny font-bold whitespace-nowrap'>
        $ {formatUsd[0]}
        {formatUsd[1] ? `.${formatUsd[1]}` : ''}
        {formatUsd[2] || ''}
      </div>

      {withAdd && (
        <Button isIconOnly color='default' size='sm' variant='light' onPress={() => addAddressBook(value, true)}>
          <IconAdd />
        </Button>
      )}

      {value && (isLocal || watchlist) && (
        <Popover radius='md'>
          <PopoverTrigger>
            <Button isIconOnly size='sm' variant='light' color='default'>
              <IconMore className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='items-stretch space-y-2.5 p-2.5'>
            {value &&
              isLocal && [
                source ? null : (
                  <Button
                    key='hide-0'
                    disableRipple
                    radius='sm'
                    variant='light'
                    color='primary'
                    className='text-foreground justify-start'
                    onPress={() => {
                      hideAccount(value);
                    }}
                  >
                    Hide
                  </Button>
                ),
                <Button
                  key='setting-1'
                  as={Link}
                  disableRipple
                  radius='sm'
                  variant='light'
                  color='primary'
                  className='text-foreground justify-start'
                  onPress={onClose}
                  href={`/account-setting?address=${value}`}
                >
                  Setting
                </Button>,
                <Button
                  key='pin-0'
                  disableRipple
                  radius='sm'
                  variant='light'
                  color='primary'
                  className='text-foreground justify-start'
                  onPress={() => {
                    if (isPinned) {
                      removePinnedAccount(value);
                    } else {
                      addPinnedAccount(value);
                    }
                  }}
                >
                  {isPinned ? 'Unpin' : 'Pin'}
                </Button>
              ]}

            {value && watchlist && (
              <Button
                key='delete-2'
                disableRipple
                radius='sm'
                variant='light'
                color='primary'
                className='text-foreground justify-start'
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
