// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import IconAdd from '@/assets/svg/icon-add.svg?react';
import IconMore from '@/assets/svg/icon-more.svg?react';
import { useBalanceTotalUsd } from '@/hooks/useChainBalances';
import { usePinAccounts } from '@/hooks/usePinAccounts';
import { formatDisplay } from '@/utils';
import { useAccountSource } from '@/wallet/useWallet';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { addressToHex } from '@mimir-wallet/polkadot-core';
import { Button, Popover, PopoverContent, PopoverTrigger, Skeleton } from '@mimir-wallet/ui';

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
  const [formatUsd, setFormatUsd] = useState<React.ReactNode>(<Skeleton className='h-4 w-16 rounded-[5px]' />);

  useEffect(() => {
    if (!totalUsd) {
      setFormatUsd(<div className='text-xs font-bold whitespace-nowrap'>$ 0</div>);
    } else {
      const formatUsd = formatDisplay(totalUsd.toString());

      setFormatUsd(
        <div className='text-xs font-bold whitespace-nowrap'>
          $ {formatUsd[0]}
          {formatUsd[1] ? `.${formatUsd[1]}` : ''}
          {formatUsd[2] || ''}
        </div>
      );
    }
  }, [totalUsd]);
  const { pinnedAccounts, addPinnedAccount, removePinnedAccount } = usePinAccounts();

  const isPinned = useMemo(() => pinnedAccounts.includes(addressToHex(value)), [pinnedAccounts, value]);

  const handleClick = useCallback(() => {
    onSelect?.(value);
  }, [onSelect, value]);

  const isLocal = isLocalAccount(value);

  return (
    <Button
      fullWidth
      onClick={handleClick}
      variant='bordered'
      color='secondary'
      size='md'
      data-selected={selected}
      className='text-foreground data-[selected=true]:bg-secondary h-[50px] justify-between rounded-[10px] px-1 py-1 sm:px-2.5'
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
      {formatUsd}

      {withAdd && (
        <Button
          isIconOnly
          className='text-inherit'
          size='sm'
          variant='light'
          onClick={() => addAddressBook(value, true)}
        >
          <IconAdd />
        </Button>
      )}

      {value && (isLocal || watchlist) && (
        <Popover>
          <PopoverTrigger asChild>
            <Button isIconOnly size='sm' variant='light' className='text-inherit'>
              <IconMore className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='flex flex-col items-stretch gap-y-2.5 p-2.5'>
            {value &&
              isLocal && [
                source ? null : (
                  <Button
                    key='hide-0'
                    radius='sm'
                    variant='light'
                    color='primary'
                    className='text-foreground justify-start'
                    onClick={() => {
                      hideAccount(value);
                    }}
                  >
                    Hide
                  </Button>
                ),
                <Button
                  key='setting-1'
                  asChild
                  radius='sm'
                  variant='light'
                  color='primary'
                  className='text-foreground justify-start'
                  onClick={onClose}
                >
                  <Link to={`/account-setting?address=${value}`}>Setting</Link>
                </Button>,
                <Button
                  key='pin-0'
                  radius='sm'
                  variant='light'
                  color='primary'
                  className='text-foreground justify-start'
                  onClick={() => {
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
                radius='sm'
                variant='light'
                color='primary'
                className='text-foreground justify-start'
                onClick={() => deleteAddress(value)}
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
