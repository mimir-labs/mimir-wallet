// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconDelete from '@/assets/svg/icon-delete.svg?react';
import IconEdit from '@/assets/svg/icon-edit.svg?react';
import { CopyButton } from '@/components';
import { DotConsoleApp, PolkadotJsApp } from '@/config';
import { useApi } from '@/hooks/useApi';
import { CallDisplaySection } from '@/params';
import { Box, IconButton, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { decodeCallSection } from './utils';

function DotConsoleButton({ network, call }: { network: string; call: string }) {
  const isDotConsoleSupport = DotConsoleApp.supportedChains.includes(network);

  if (!isDotConsoleSupport) {
    const url = PolkadotJsApp.urlSearch(network);

    url.hash = `#/extrinsics/decode/${call}`;

    return (
      <IconButton component={Link} size='small' color='inherit' to={`/explorer/${encodeURIComponent(url.toString())}`}>
        <img src={PolkadotJsApp.icon} alt='Polkadot.js' width={16} height={16} />
      </IconButton>
    );
  }

  const url = DotConsoleApp.urlSearch(network);

  url.pathname = '/extrinsics';
  url.searchParams.set('callData', call);

  return (
    <IconButton component={Link} size='small' color='inherit' to={`/explorer/${encodeURIComponent(url.toString())}`}>
      <img src={DotConsoleApp.icon} alt='Polkadot.js' width={16} height={16} />
    </IconButton>
  );
}

function TemplateItem({
  name,
  call,
  onDelete,
  onEditName
}: {
  name: string;
  call: string;
  onDelete: () => void;
  onEditName: (name: string) => void;
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
    <Box
      sx={{
        paddingX: 2,
        height: 40,
        borderRadius: 1,
        bgcolor: 'secondary.main',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', width: 100, minWidth: 80 }}>
        {isEditing ? (
          <Box
            autoFocus
            component='input'
            onBlur={() => {
              editName && onEditName(editName);
              setIsEditing(false);
            }}
            onChange={(e) => setEditName(e.target.value)}
            sx={{
              flex: '1 0 auto',
              border: 'none',
              outline: 'none',
              padding: 0,
              bgcolor: 'transparent',
              width: 0,
              font: 'inherit'
            }}
            defaultValue={name}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                editName && onEditName(editName);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <Typography>{name}</Typography>
        )}
        <IconButton color='inherit' onClick={() => setIsEditing(true)} size='small' sx={{ opacity: 0.5 }}>
          <SvgIcon component={IconEdit} inheritViewBox />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CallDisplaySection section={section} method={method} />
        <CopyButton value={call} size='sm' />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <DotConsoleButton network={network} call={call} />
        <IconButton size='small' color='error' onClick={() => onDelete()}>
          <SvgIcon component={IconDelete} inheritViewBox />
        </IconButton>
      </Box>
    </Box>
  );
}

export default TemplateItem;
