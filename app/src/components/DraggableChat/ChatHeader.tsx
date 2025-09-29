// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { X } from 'lucide-react';

import { Button } from '@mimir-wallet/ui';

import AddressRow from '../AddressRow';
import MimoLogo from './MimoLogo';

export function AccountInfo() {
  const { current } = useAccount();

  return (
    <div className='bg-secondary flex h-[30px] items-center justify-center gap-[5px] px-2.5 py-0.5'>
      <span className='text-foreground text-[12px] font-normal'>Current Account</span>
      <AddressRow
        value={current}
        className='text-xs [&_.AddressRow-Address]:text-[#949494] [&_.AddressRow-Name]:font-normal'
        iconSize={20}
        withAddress
        withName
        shorten
        showMultisigBadge={false}
      />
    </div>
  );
}

// Chat title bar component (not draggable)
export interface ChatTitleProps {
  onClose: () => void;
}

export function ChatTitle({ onClose }: ChatTitleProps) {
  return (
    <>
      <div className='flex items-center gap-2.5 px-[15px] py-3'>
        <MimoLogo className='border-primary/20 rounded-full border-1' size={30} />
        <span className='text-foreground flex-1 text-[16px] font-normal tracking-[0.16px]'>Mimo</span>
        <Button isIconOnly size='sm' variant='light' className='text-foreground' onClick={onClose}>
          <X size={16} className='opacity-50' />
        </Button>
      </div>
      {/* Divider */}
      <div className='bg-secondary h-px w-full' />
    </>
  );
}
