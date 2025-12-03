// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import { useNetwork } from '@mimir-wallet/polkadot-core';
import { Button, Tooltip } from '@mimir-wallet/ui';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { decodeCallSection } from './utils';

import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconEdit from '@/assets/svg/icon-edit.svg?react';
import { CopyButton } from '@/components';
import { DotConsoleApp } from '@/config';
import { useRegistry } from '@/hooks/useRegistry';

function DotConsoleButton({ network, call }: { network: string; call: string }) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    return null;
  }

  const url = DotConsoleApp.urlSearch?.(network) || new URL(DotConsoleApp.url);

  url.pathname = '/extrinsics';
  url.searchParams.set('callData', call);

  return (
    <Button isIconOnly asChild size='sm' color='primary' variant='light'>
      <Link to='/explorer/$url' params={{ url: url.toString() }}>
        <img src={DotConsoleApp.icon} alt='Dot Console' width={16} height={16} />
      </Link>
    </Button>
  );
}

function TemplateItem({
  name,
  call,
  onDelete,
  onEditName,
  onView
}: {
  name: string;
  call: HexString;
  onDelete: () => void;
  onEditName: (name: string) => void;
  onView: (name: string, call: HexString) => void;
}) {
  const { network } = useNetwork();
  const { registry } = useRegistry(network);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  // Derive section and method from registry and call
  const [section, method] = useMemo(() => {
    if (!registry) return [undefined, undefined];

    const result = decodeCallSection(registry, call);

    if (!result) return [undefined, undefined];

    return result;
  }, [registry, call]);

  return (
    <div className='bg-secondary grid h-[40px] grid-cols-12 gap-2 rounded-[10px] pl-2 sm:pl-3'>
      <div className='col-span-4 flex items-center'>
        {isEditing ? (
          <input
            autoFocus
            onBlur={() => {
              editName && onEditName(editName);
              setIsEditing(false);
            }}
            onChange={(e) => setEditName(e.target.value)}
            className='font-inherit w-0 flex-auto shrink-0 border-none bg-transparent p-0 outline-none'
            defaultValue={name}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                editName && onEditName(editName);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <p className='line-clamp-2 max-w-20 overflow-hidden text-ellipsis'>{name}</p>
        )}
        <Button
          isIconOnly
          onClick={() => setIsEditing(true)}
          size='sm'
          className='text-inherit opacity-50'
          variant='light'
        >
          <IconEdit />
        </Button>
      </div>

      <div className='col-span-8 flex items-center justify-between'>
        <div className='flex items-center'>
          <button className='text-foreground' onClick={() => onView(name, call)}>
            <Tooltip content={`${section}.${method}`} color='foreground'>
              <div className='max-w-[110px] overflow-hidden text-ellipsis underline sm:max-w-[130px]'>
                {section}.{method}
              </div>
            </Tooltip>
          </button>
          <CopyButton value={call} size='sm' />
        </div>

        <div className='shrink-0'>
          <DotConsoleButton network={network} call={call} />
          <Button isIconOnly variant='light' size='sm' color='danger' onClick={() => onDelete()}>
            <IconDelete />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TemplateItem;
