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

import { addressEq, encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Chip, usePress } from '@mimir-wallet/ui';

import AddressComp from './Address';
import AddressName from './AddressName';
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
  const { meta: { isMultisig, isProxied, isPure, proxyNetworks, pureCreatedAt } = {} } = useAddressMeta(address);
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const { networks } = useNetworks();
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

  const addressNetworks = isPure
    ? networks.filter((network) => network.genesisHash === pureCreatedAt)
    : showNetworkProxied && isProxied
      ? proxyNetworks
        ? networks.filter((network) => proxyNetworks.includes(network.genesisHash))
        : []
      : [];

  const showTypeWidth = useMemo(() => {
    if (!showType && !withPendingTxCounts) return 0;
    let width = 0;

    if (isMultisig) width += 60; // Multisig chip width
    if (isPure || isProxied) width += isPure ? 44 : 46; // Pure/Proxied chip width
    if (withPendingTxCounts && totalCounts) width += 20; // Pending transaction count badge width

    return width;
  }, [showType, withPendingTxCounts, isMultisig, isPure, isProxied, totalCounts]);

  return (
    <div className={`AddressCell flex-1 flex items-center gap-2.5 min-w-0 ${className}`} style={style}>
      <IdentityIcon className='AddressCell-Icon' size={iconSize} value={address} withBorder={withIconBorder} />
      <div className='AddressCell-Content flex flex-col gap-y-[2px] min-w-0 flex-1'>
        <div className='flex items-center gap-1 min-w-0 overflow-hidden'>
          <span
            className='AddressCell-Name min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-left'
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
            <div className='bg-[#FF8C00] text-[10px] w-4 h-4 rounded-full text-white flex items-center justify-center'>
              {totalCounts}
            </div>
          )}
        </div>

        <div className='AddressCell-Address text-foreground/50 h-[16px] flex items-center text-tiny min-w-0'>
          {addressNetworks.map((network) => (
            <Avatar
              key={network.genesisHash}
              style={{ marginRight: 4 }}
              src={network.icon}
              className='w-3 h-3 flex-shrink-0'
            />
          ))}
          <span {...(addressCopyDisabled ? {} : pressProps)} className='truncate min-w-0'>
            <AddressComp shorten={shorten} value={address} />
          </span>
          {withCopy && <CopyAddress size='sm' address={address} className='opacity-50 flex-shrink-0' />}
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
                className='opacity-50 text-foreground/50 w-[18px] h-[18px] flex-shrink-0'
              >
                <IconAddressBook className='w-3 h-3' />
              </Button>
            )}
          {icons && <div className='flex-shrink-0'>{icons}</div>}
        </div>
      </div>
    </div>
  );
}

export default React.memo(AddressCell);
