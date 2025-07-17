// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import { useCopyAddressToClipboard } from '@/hooks/useCopyAddress';
import { useMultiChainTransactionCounts } from '@/hooks/useTransactions';
import { hexToU8a } from '@polkadot/util';
import React, { useMemo } from 'react';

import { addressEq, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Chip, usePress } from '@mimir-wallet/ui';

import AddressComp from './Address';
import AddressName from './AddressName';
import AddressNetworks from './AddressNetworks';
import CopyAddress from './CopyAddress';
import IdentityIcon from './IdentityIcon';

interface Props {
  defaultName?: string;
  addressCopyDisabled?: boolean;
  value?: AccountId | AccountIndex | Address | Uint8Array | string | null;
  className?: string;
  iconSize?: number;
  shorten?: boolean;
  showType?: boolean;
  withCopy?: boolean;
  withAddressBook?: boolean;
  withPendingTxCounts?: boolean;
  style?: React.CSSProperties;
  icons?: React.ReactNode;
  withIconBorder?: boolean;
  showNetworkProxied?: boolean;
}

function AddressCell({
  defaultName,
  addressCopyDisabled,
  icons,
  withPendingTxCounts,
  className,
  shorten = true,
  showType = false,
  value,
  style,
  iconSize = 30,
  withCopy = false,
  withAddressBook = false,
  withIconBorder = false,
  showNetworkProxied = false
}: Props) {
  const { chainSS58 } = useApi();
  const address = useMemo(() => encodeAddress(value, chainSS58), [value, chainSS58]);
  const { meta: { isMultisig, isProxied, isPure } = {} } = useAddressMeta(address);
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const copyAddress = useCopyAddressToClipboard(address);
  const { pressProps } = usePress({
    onPressStart: (e) => {
      e.continuePropagation();
    },
    onPress: (e) => {
      e.continuePropagation();
      copyAddress();
    }
  });
  const [transactionCounts] = useMultiChainTransactionCounts(withPendingTxCounts ? address : undefined);
  const totalCounts = useMemo(
    () => Object.values(transactionCounts).reduce((acc, curr) => acc + curr.pending, 0),
    [transactionCounts]
  );

  const showTypeWidth = useMemo(() => {
    if (!showType && !withPendingTxCounts) return 0;
    let width = 0;

    if (isMultisig) width += 60; // Multisig chip width
    if (isPure || isProxied) width += isPure ? 44 : 46; // Pure/Proxied chip width
    if (withPendingTxCounts && totalCounts) width += 20; // Pending transaction count badge width

    return width;
  }, [showType, withPendingTxCounts, isMultisig, isPure, isProxied, totalCounts]);

  return (
    <div className={`AddressCell flex min-w-0 flex-1 items-center gap-2.5 ${className}`} style={style}>
      <IdentityIcon className='AddressCell-Icon' size={iconSize} value={address} withBorder={withIconBorder} />
      <div className='AddressCell-Content flex min-w-0 flex-1 flex-col gap-y-[2px]'>
        <div className='flex min-w-0 items-center gap-1 overflow-hidden'>
          <span
            className='AddressCell-Name min-w-0 overflow-hidden text-left font-bold text-ellipsis whitespace-nowrap'
            style={{
              maxWidth: showType && (isMultisig || isPure || isProxied) ? `calc(100% - ${showTypeWidth}px)` : '100%'
            }}
          >
            <AddressName defaultName={defaultName} value={value} />
          </span>

          {showType && isMultisig && (
            <Chip color='secondary' size='sm'>
              Multisig
            </Chip>
          )}

          {showType && (isPure || isProxied) && (
            <Chip color='default' className='bg-[#B700FF]/5 text-[#B700FF]' size='sm'>
              {isPure ? 'Pure' : 'Proxied'}
            </Chip>
          )}

          {withPendingTxCounts && !!totalCounts && (
            <div className='flex h-4 w-4 items-center justify-center rounded-full bg-[#FF8C00] text-[10px] text-white'>
              {totalCounts}
            </div>
          )}
        </div>

        <div className='AddressCell-Address text-foreground/50 text-tiny flex h-[16px] min-w-0 items-center'>
          {showNetworkProxied && (
            <div className='mr-1 flex items-center gap-1'>
              <AddressNetworks address={address} avatarSize={12} />
            </div>
          )}
          <span {...(addressCopyDisabled ? {} : pressProps)} className='min-w-0 truncate'>
            <AddressComp shorten={shorten} value={address} />
          </span>
          {withCopy && <CopyAddress size='sm' address={address} className='flex-shrink-0 opacity-50' />}
          {withAddressBook &&
            address &&
            !isLocalAccount(address) &&
            !isLocalAddress(address) &&
            !addressEq(hexToU8a('0x0', 256), address) && (
              <Button
                isIconOnly
                color='default'
                onPress={() => {
                  addAddressBook(address);
                }}
                variant='light'
                size='sm'
                className='text-foreground/50 h-[18px] w-[18px] flex-shrink-0 opacity-50'
              >
                <IconAddressBook className='h-3 w-3' />
              </Button>
            )}
          {icons && <div className='flex-shrink-0'>{icons}</div>}
        </div>
      </div>
    </div>
  );
}

export default React.memo(AddressCell);
