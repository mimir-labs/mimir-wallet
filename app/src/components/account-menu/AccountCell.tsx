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
      className='justify-between px-1 sm:px-2.5 py-1 text-foreground h-[50px] rounded-medium data-[selected=true]:bg-secondary'
    >
      <AddressCell
        className='flex-1 min-w-0'
        withIconBorder
        shorten
        showType
        value={value}
        withCopy
        withAddressBook
        addressCopyDisabled
        showNetworkProxied={isLocal}
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
              <IconMore className='w-4 h-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='p-2.5 space-y-2.5 items-stretch'>
            {value &&
              isLocal && [
                source ? null : (
                  <Button
                    key='hide-0'
                    disableRipple
                    radius='sm'
                    variant='light'
                    color='primary'
                    className='justify-start text-foreground'
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
                  className='justify-start text-foreground'
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
                  className='justify-start text-foreground'
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
