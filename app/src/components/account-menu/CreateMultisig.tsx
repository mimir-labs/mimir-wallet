// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip } from '@mimir-wallet/ui';
import { Link, useNavigate } from '@tanstack/react-router';
import React, { useRef, useState } from 'react';

import IconAddFill from '@/assets/svg/icon-add-fill.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import { useElementWidth } from '@/hooks/useElementWidth';

function CreateMultisig({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLButtonElement>(null);
  const width = useElementWidth(ref);
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className='h-12' fullWidth radius='md' ref={ref} onClick={() => setOpen(true)}>
            <IconAddFill />
            Create New
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side='top'
          align='start'
          className='flex flex-col items-stretch space-y-2.5 p-2.5'
          style={{ width }}
        >
          <Button
            asChild
            key='Multisig'
            radius='sm'
            variant='light'
            color='primary'
            className='text-foreground'
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}
          >
            <Link to='/create-multisig'>Create Multisig</Link>
          </Button>
          <Button
            key='Proxy'
            radius='sm'
            variant='light'
            color='primary'
            className='text-foreground'
            onClick={() => {
              setOpen(false);
              navigate({ to: '/add-proxy' });
              onClose?.();
            }}
          >
            Add Proxy
            <Tooltip color='foreground' content='Can be controlled by one or more proxy accounts to act on its behalf.'>
              <IconQuestion className='text-primary' />
            </Tooltip>
          </Button>
          <Button
            key='Pure'
            radius='sm'
            variant='light'
            color='primary'
            className='text-foreground'
            onClick={() => {
              setOpen(false);
              navigate({ to: '/create-pure' });
              onClose?.();
            }}
          >
            Create Pure Proxy
            <Tooltip
              color='foreground'
              content='Pure proxies are new keyless accounts that are created by a primary account.'
            >
              <IconQuestion className='text-primary' />
            </Tooltip>
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default React.memo(CreateMultisig);
