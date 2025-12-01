// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Tooltip } from '@mimir-wallet/ui';
import { useState } from 'react';

import AddressRow from '../AddressRow';

import MimoLogo from './MimoLogo';

import { useAccount } from '@/accounts/useAccount';
import IconChatSlash from '@/assets/svg/icon-chat-slash.svg?react';
import IconMinimize from '@/assets/svg/icon-minimize.svg?react';
import { getKeyboardShortcut } from '@/utils/common';

export function AccountInfo() {
  const { current } = useAccount();

  return (
    <div className='bg-secondary flex h-[30px] items-center justify-center gap-[5px] px-2.5 py-0.5'>
      <svg xmlns='http://www.w3.org/2000/svg' width='8' height='14' viewBox='0 0 8 14' fill='none'>
        <path
          d='M3 2C3 2.82843 2.32843 3.5 1.5 3.5C0.671573 3.5 0 2.82843 0 2C0 1.17157 0.671573 0.5 1.5 0.5C2.32843 0.5 3 1.17157 3 2Z'
          fill='currentColor'
        />
        <path
          d='M3 2C3 2.82843 2.32843 3.5 1.5 3.5C0.671573 3.5 0 2.82843 0 2C0 1.17157 0.671573 0.5 1.5 0.5C2.32843 0.5 3 1.17157 3 2Z'
          fill='black'
          fillOpacity='0.2'
        />
        <path
          d='M3 7C3 7.82843 2.32843 8.5 1.5 8.5C0.671573 8.5 0 7.82843 0 7C0 6.17157 0.671573 5.5 1.5 5.5C2.32843 5.5 3 6.17157 3 7Z'
          fill='currentColor'
        />
        <path
          d='M3 7C3 7.82843 2.32843 8.5 1.5 8.5C0.671573 8.5 0 7.82843 0 7C0 6.17157 0.671573 5.5 1.5 5.5C2.32843 5.5 3 6.17157 3 7Z'
          fill='black'
          fillOpacity='0.2'
        />
        <path
          d='M3 12C3 12.8284 2.32843 13.5 1.5 13.5C0.671573 13.5 0 12.8284 0 12C0 11.1716 0.671573 10.5 1.5 10.5C2.32843 10.5 3 11.1716 3 12Z'
          fill='currentColor'
        />
        <path
          d='M3 12C3 12.8284 2.32843 13.5 1.5 13.5C0.671573 13.5 0 12.8284 0 12C0 11.1716 0.671573 10.5 1.5 10.5C2.32843 10.5 3 11.1716 3 12Z'
          fill='black'
          fillOpacity='0.2'
        />
        <path
          d='M8 2C8 2.82843 7.32843 3.5 6.5 3.5C5.67157 3.5 5 2.82843 5 2C5 1.17157 5.67157 0.5 6.5 0.5C7.32843 0.5 8 1.17157 8 2Z'
          fill='currentColor'
        />
        <path
          d='M8 2C8 2.82843 7.32843 3.5 6.5 3.5C5.67157 3.5 5 2.82843 5 2C5 1.17157 5.67157 0.5 6.5 0.5C7.32843 0.5 8 1.17157 8 2Z'
          fill='black'
          fillOpacity='0.2'
        />
        <path
          d='M8 7C8 7.82843 7.32843 8.5 6.5 8.5C5.67157 8.5 5 7.82843 5 7C5 6.17157 5.67157 5.5 6.5 5.5C7.32843 5.5 8 6.17157 8 7Z'
          fill='currentColor'
        />
        <path
          d='M8 7C8 7.82843 7.32843 8.5 6.5 8.5C5.67157 8.5 5 7.82843 5 7C5 6.17157 5.67157 5.5 6.5 5.5C7.32843 5.5 8 6.17157 8 7Z'
          fill='black'
          fillOpacity='0.2'
        />
        <path
          d='M8 12C8 12.8284 7.32843 13.5 6.5 13.5C5.67157 13.5 5 12.8284 5 12C5 11.1716 5.67157 10.5 6.5 10.5C7.32843 10.5 8 11.1716 8 12Z'
          fill='currentColor'
        />
        <path
          d='M8 12C8 12.8284 7.32843 13.5 6.5 13.5C5.67157 13.5 5 12.8284 5 12C5 11.1716 5.67157 10.5 6.5 10.5C7.32843 10.5 8 11.1716 8 12Z'
          fill='black'
          fillOpacity='0.2'
        />
      </svg>
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
  onClearChat?: () => void;
}

export function ChatTitle({ onClose, onClearChat }: ChatTitleProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div className='flex items-center gap-2.5 px-[15px] py-3'>
        <MimoLogo className='border-primary/20 rounded-full border-1' size={30} />
        <span className='text-foreground text-[16px] font-normal tracking-[0.16px]'>Mimo</span>
        <Tooltip content='Clear conversation'>
          <Button
            isIconOnly
            size='sm'
            variant='light'
            className='text-foreground'
            onClick={onClearChat}
            aria-label='Clear chat'
          >
            <IconChatSlash className='h-4 w-4 opacity-50' />
          </Button>
        </Tooltip>
        <div className='flex-1' />
        <Button
          variant='light'
          size='sm'
          data-hovered={isHovered}
          onClick={onClose}
          isIconOnly={!isHovered}
          radius='md'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className='data-[hovered=true]:bg-secondary py-[10px] text-[#949494] transition-all'
          aria-label='Minimize'
        >
          {isHovered && (
            <span className='text-[14px] leading-normal font-bold text-nowrap text-current'>
              {getKeyboardShortcut('K')}
            </span>
          )}
          <IconMinimize className='h-5 w-5 text-current' />
        </Button>
      </div>
      {/* Divider */}
      <div className='bg-secondary h-px w-full' />
    </>
  );
}
