// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry } from '@polkadot/types/types';

import { Box, IconButton, Link, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import IconEdit from '@mimir-wallet/assets/svg/icon-edit.svg?react';
import { CopyButton } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { CallDisplaySection } from '@mimir-wallet/params';

function decodeCallData(registry: Registry, callData: string): [string, string] | undefined {
  if (!callData) return undefined;

  try {
    const call = registry.createType('Call', callData);

    return [call.section, call.method];
  } catch {
    return undefined;
  }
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
  const { api } = useApi();
  const [section, setSection] = useState<string | undefined>(undefined);
  const [method, setMethod] = useState<string | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const result = decodeCallData(api.registry, call);

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
              onEditName(editName);
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
                onEditName(editName);
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
        <CopyButton value={call} color='inherit' size='small' sx={{ opacity: 0.5 }} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton component={Link} target='_blank' size='small' color='inherit'>
          <Box sx={{ width: 14, height: 14, transform: 'translateY(2px)' }}>📟</Box>
        </IconButton>
        <IconButton size='small' color='error' onClick={() => onDelete()}>
          <SvgIcon component={IconDelete} inheritViewBox />
        </IconButton>
      </Box>
    </Box>
  );
}

export default TemplateItem;
