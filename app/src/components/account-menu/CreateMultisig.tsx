// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconAddFill from '@/assets/svg/icon-add-fill.svg?react';
import IconQuestion from '@/assets/svg/icon-question-fill.svg?react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip } from '@mimir-wallet/ui';

function CreateMultisig({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    setWidth(ref.current?.clientWidth);
  }, []);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button className='h-12' fullWidth radius='md' ref={ref}>
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
          <Button asChild key='Multisig' radius='sm' variant='light' color='primary' className='text-foreground'>
            <Link to='/create-multisig'>Create Multisig</Link>
          </Button>
          <Button
            key='Proxy'
            radius='sm'
            variant='light'
            color='primary'
            className='text-foreground'
            onClick={() => {
              navigate('/add-proxy');
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
              navigate('/create-pure');
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
