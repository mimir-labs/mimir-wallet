// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconCopy from '@/assets/svg/icon-copy.svg?react';
import { useCopyAddressToClipboard } from '@/hooks/useCopyAddress';
import React from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Avatar, usePress } from '@mimir-wallet/ui';

import Address from '../Address';
import AddressName from '../AddressName';
import AppName from '../AppName';
import IdentityIcon from '../IdentityIcon';

interface Props {
  address: string;
  website?: string | null;
  iconUrl?: string | null;
  appName?: string | null;
}

function TxInfo({ address, website, iconUrl, appName }: Props) {
  const { chain } = useApi();
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

  return (
    <div className='flex items-center gap-2.5'>
      <div className='shrink-0'>
        <IdentityIcon value={address} size={40} />
      </div>
      <div className='flex flex-1 flex-col gap-[5px]'>
        <div className='flex flex-wrap items-center gap-[5px]'>
          <span className='text-foreground font-bold'>
            <AddressName value={address} />
          </span>
          <span className='text-primary font-bold'>Sending on</span>
          <div className='rounded-medium bg-secondary flex items-center gap-[5px] px-2.5 py-1'>
            <Avatar src={chain.icon} alt={chain.name} style={{ width: 16, height: 16, background: 'transparent' }} />
            <span className='text-foreground text-small font-bold'>{chain.name}</span>
          </div>
          {(!!website || !!appName) && !website?.startsWith('mimir://internal') && (
            <>
              <span className='text-primary font-bold'>via</span>
              <div className='rounded-medium bg-secondary flex items-center px-2.5 py-1 font-bold'>
                <AppName website={website} appName={appName} iconUrl={iconUrl} iconSize={16} />
              </div>
            </>
          )}
        </div>
        <div
          className='text-tiny text-foreground/50 hover:text-primary flex cursor-pointer items-center gap-[5px] transition-colors'
          {...pressProps}
        >
          <span>
            <Address value={address} shorten={false} />
          </span>
          <IconCopy className='h-3.5 w-3.5' />
        </div>
      </div>
    </div>
  );
}

export default React.memo(TxInfo);
