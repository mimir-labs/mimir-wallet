// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { useAccount } from '@/accounts/useAccount';
import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconAddressBook from '@/assets/svg/icon-address-book.svg?react';
import { hexToU8a } from '@polkadot/util';
import React, { useMemo } from 'react';

import { addressEq, encodeAddress, useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Avatar, Button, Chip } from '@mimir-wallet/ui';

import AddressComp from './Address';
import AddressName from './AddressName';
import CopyAddress from './CopyAddress';
import IdentityIcon from './IdentityIcon';

interface Props {
  defaultName?: string;
  value?: AccountId | AccountIndex | Address | Uint8Array | string | null;
  className?: string;
  iconSize?: number;
  shorten?: boolean;
  showType?: boolean;
  withCopy?: boolean;
  withAddressBook?: boolean;
  width?: number | string;
  namePost?: React.ReactNode | null;
  icons?: React.ReactNode;
}

function AddressCell({
  defaultName,
  icons,
  namePost,
  className,
  shorten = true,
  showType = false,
  value,
  width,
  iconSize = 30,
  withCopy = false,
  withAddressBook = false
}: Props) {
  const { chainSS58 } = useApi();
  const address = useMemo(() => encodeAddress(value, chainSS58), [value, chainSS58]);
  const { meta: { isMultisig, isProxied, isPure, pureCreatedAt } = {} } = useAddressMeta(address);
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const { networks } = useNetworks();

  const pureNetwork = isPure && pureCreatedAt && networks.find((network) => network.genesisHash === pureCreatedAt);

  return (
    <div className={`AddressCell flex-1 flex items-center gap-[5px] ${className}`} style={{ width }}>
      <IdentityIcon className='AddressCell-Icon' size={iconSize} value={address} />
      <div className='AddressCell-Content space-y-[2px]'>
        <div className='flex items-center gap-1'>
          <span className='AddressCell-Name inline-flex max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap font-bold'>
            <AddressName defaultName={defaultName} value={value} />
          </span>
          {namePost}
          {showType && (
            <>
              {isMultisig && (
                <Chip color='secondary' size='sm'>
                  Multisig
                </Chip>
              )}
              {(isPure || isProxied) && (
                <Chip color='default' className='bg-[#B700FF]/5 text-[#B700FF]' size='sm'>
                  {isPure ? 'Pure' : 'Proxied'}
                </Chip>
              )}
            </>
          )}
        </div>
        <span className='AddressCell-Address text-foreground/50 h-[16px] flex items-center text-tiny whitespace-nowrap'>
          {pureNetwork?.icon ? <Avatar style={{ marginRight: 4 }} src={pureNetwork.icon} className='w-3 h-3' /> : null}
          <AddressComp shorten={shorten} value={address} />
          {withCopy && <CopyAddress size='sm' address={address} className='opacity-50' />}
          {icons}
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
                className='opacity-50 text-foreground/50 w-[18px] h-[18px]'
              >
                <IconAddressBook className='w-3 h-3' />
              </Button>
            )}
        </span>
      </div>
    </div>
  );
}

export default React.memo(AddressCell);
