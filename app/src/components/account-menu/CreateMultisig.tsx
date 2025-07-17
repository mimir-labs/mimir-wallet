// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconAddFill from '@/assets/svg/icon-add-fill.svg?react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Link, Popover, PopoverContent, PopoverTrigger } from '@mimir-wallet/ui';

function CreateMultisig({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLButtonElement>(null);
  const [width, setWidth] = useState<number>();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setWidth(ref.current?.clientWidth ? ref.current.clientWidth * 0.97 : undefined);
  }, []);

  return (
    <>
      <Popover
        radius='md'
        placement='top-start'
        style={{ width }}
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
      >
        <PopoverTrigger>
          <Button className='h-12' fullWidth startContent={<IconAddFill />} radius='md' ref={ref}>
            Create New
          </Button>
        </PopoverTrigger>
        <PopoverContent className='items-stretch space-y-2.5 p-2.5'>
          <Button
            as={Link}
            key='hide-0'
            disableRipple
            radius='sm'
            variant='light'
            color='primary'
            className='text-foreground'
            href='/create-multisig'
            onPress={() => {
              setIsOpen(false);
            }}
          >
            Create Multisig
          </Button>
          <Button
            key='hide-0'
            disableRipple
            radius='sm'
            variant='light'
            color='primary'
            className='text-foreground'
            onPress={() => {
              navigate('/add-proxy');
              onClose?.();
              setIsOpen(false);
            }}
          >
            Add Proxy
          </Button>
          <Button
            key='hide-0'
            disableRipple
            radius='sm'
            variant='light'
            color='primary'
            className='text-foreground'
            onPress={() => {
              navigate('/create-pure');
              onClose?.();
              setIsOpen(false);
            }}
          >
            Create Pure Proxy
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default React.memo(CreateMultisig);
