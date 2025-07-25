// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconEdit from '@/assets/svg/icon-edit.svg?react';
import { CopyButton } from '@/components';
import { DotConsoleApp } from '@/config';
import { useEffect, useState } from 'react';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Button, Link, Tooltip } from '@mimir-wallet/ui';

import { decodeCallSection } from './utils';

function DotConsoleButton({ network, call }: { network: string; call: string }) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    return null;
  }

  const url = DotConsoleApp.urlSearch?.(network) || new URL(DotConsoleApp.url);

  url.pathname = '/extrinsics';
  url.searchParams.set('callData', call);

  return (
    <Button
      isIconOnly
      as={Link}
      size='sm'
      color='primary'
      href={`/explorer/${encodeURIComponent(url.toString())}`}
      variant='light'
    >
      <img src={DotConsoleApp.icon} alt='Dot Console' width={16} height={16} />
    </Button>
  );
}

function TemplateItem({
  name,
  call,
  onDelete,
  onEditName,
  onView,
  registry
}: {
  name: string;
  call: HexString;
  registry: Registry;
  onDelete: () => void;
  onEditName: (name: string) => void;
  onView: (name: string, call: HexString) => void;
}) {
  const { network } = useApi();
  const [section, setSection] = useState<string | undefined>(undefined);
  const [method, setMethod] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const result = decodeCallSection(registry, call);

    if (!result) return;

    const [section, method] = result;

    setSection(section);
    setMethod(method);
  }, [registry, call]);

  return (
    <div className='rounded-medium bg-secondary grid h-[40px] grid-cols-12 gap-2 pl-2 sm:pl-3'>
      <div className='col-span-4 flex items-center'>
        {isEditing ? (
          <input
            autoFocus
            onBlur={() => {
              editName && onEditName(editName);
              setIsEditing(false);
            }}
            onChange={(e) => setEditName(e.target.value)}
            className='font-inherit w-0 flex-auto flex-shrink-0 border-none bg-transparent p-0 outline-none'
            defaultValue={name}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                editName && onEditName(editName);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <p className='max-w-[80px] overflow-hidden text-ellipsis'>{name}</p>
        )}
        <Button
          isIconOnly
          color='default'
          onPress={() => setIsEditing(true)}
          size='sm'
          className='opacity-50'
          variant='light'
        >
          <IconEdit />
        </Button>
      </div>

      <div className='col-span-8 flex items-center justify-between'>
        <div className='flex items-center'>
          <Link as='button' color='foreground' onPress={() => onView(name, call)}>
            <Tooltip content={`${section}.${method}`} closeDelay={0} color='foreground'>
              <span className='max-w-[110px] overflow-hidden text-ellipsis underline sm:max-w-[130px]'>
                {section}.{method}
              </span>
            </Tooltip>
          </Link>
          <CopyButton value={call} size='sm' />
        </div>

        <div className='shrink-0'>
          <DotConsoleButton network={network} call={call} />
          <Button isIconOnly variant='light' size='sm' color='danger' onPress={() => onDelete()}>
            <IconDelete />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TemplateItem;
