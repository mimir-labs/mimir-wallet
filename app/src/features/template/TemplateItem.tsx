// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';

import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconEdit from '@/assets/svg/icon-edit.svg?react';
import { CopyButton } from '@/components';
import { DotConsoleApp } from '@/config';
import { useApi } from '@/hooks/useApi';
import { CallDisplaySection } from '@/params';
import { useEffect, useState } from 'react';

import { Button, Link } from '@mimir-wallet/ui';

import { decodeCallSection } from './utils';

function DotConsoleButton({ network, call }: { network: string; call: string }) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    return null;
  }

  const url = DotConsoleApp.urlSearch(network);

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
  onView
}: {
  name: string;
  call: HexString;
  onDelete: () => void;
  onEditName: (name: string) => void;
  onView: (name: string, call: HexString) => void;
}) {
  const { api, network } = useApi();
  const [section, setSection] = useState<string | undefined>(undefined);
  const [method, setMethod] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const result = decodeCallSection(api.registry, call);

    if (!result) return;

    const [section, method] = result;

    setSection(section);
    setMethod(method);
  }, [api.registry, call]);

  return (
    <div className='px-3 sm:px-4 h-[40px] rounded-medium bg-secondary flex justify-between items-center gap-2.5'>
      <div className='flex items-center w-[100px] min-w-[80px]'>
        {isEditing ? (
          <input
            autoFocus
            onBlur={() => {
              editName && onEditName(editName);
              setIsEditing(false);
            }}
            onChange={(e) => setEditName(e.target.value)}
            className='flex-auto flex-shrink-0 border-none outline-none p-0 bg-transparent w-0 font-inherit'
            defaultValue={name}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                editName && onEditName(editName);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <p>{name}</p>
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

      <div className='flex items-center'>
        <Link as='button' underline='always' color='foreground' onPress={() => onView(name, call)}>
          <CallDisplaySection section={section} method={method} />
        </Link>
        <CopyButton value={call} size='sm' />
      </div>

      <div className='flex items-center'>
        <DotConsoleButton network={network} call={call} />
        <Button isIconOnly variant='light' size='sm' color='danger' onPress={() => onDelete()}>
          <IconDelete />
        </Button>
      </div>
    </div>
  );
}

export default TemplateItem;
