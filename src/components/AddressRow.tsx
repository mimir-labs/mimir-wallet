// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { ReactComponent as IconEdit } from '@mimir-wallet/assets/svg/icon-edit.svg';
import { useAddressMeta } from '@mimir-wallet/hooks';
import { Box, IconButton, Stack, SvgIcon } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import AddressComp from './Address';
import AddressName from './AddressName';
import CopyButton from './CopyButton';
import IdentityIcon from './IdentityIcon';

interface Props {
  defaultName?: string;
  value?: AccountId | AccountIndex | Address | string | null;
  size?: 'small' | 'medium' | 'large';
  shorten?: boolean;
  isMe?: boolean;
  withAddress?: boolean;
  withCopy?: boolean;
  withName?: boolean;
  withEdit?: boolean;
  onClick?: (value?: string) => void;
}

function EditName({ address, onDone }: { onDone: () => void; address?: AccountId | AccountIndex | Address | string | null }) {
  const { name, saveName, setName } = useAddressMeta(address?.toString());

  return (
    <Box
      autoFocus
      component='input'
      onBlur={() => {
        saveName();
        onDone();
      }}
      onChange={(e) => setName(e.target.value)}
      sx={{ border: 'none', outline: 'none' }}
      value={name}
    />
  );
}

function AddressRow({ defaultName, isMe, onClick, shorten, size = 'medium', value, withAddress = false, withCopy = false, withEdit, withName = true }: Props) {
  const [editing, setEditing] = useState(false);

  const [iconSize, spacing] = useMemo((): [number, number] => {
    return size === 'small' ? [20, 0.5] : size === 'medium' ? [30, 0.5] : [40, 0.5];
  }, [size]);

  const _onClick = useCallback(() => {
    onClick?.(value?.toString());
  }, [onClick, value]);

  return (
    <Stack alignItems='center' className='AddressRow' direction='row' onClick={_onClick} spacing={spacing} sx={{ cursor: onClick ? 'pointer' : undefined }}>
      <IdentityIcon className='AddressRow-Icon' isMe={isMe} size={iconSize} value={value} />
      {withName && (
        <Box component='span' sx={{ fontWeight: withName && withAddress ? 700 : undefined }}>
          {editing ? <EditName address={value} onDone={() => setEditing(false)} /> : <AddressName defaultName={defaultName} value={value} />}
        </Box>
      )}
      {withAddress && (
        <Box component='span'>
          <AddressComp shorten={shorten} value={value} />
        </Box>
      )}
      {withCopy && <CopyButton value={value?.toString()} />}
      {withEdit && (
        <IconButton color='inherit' onClick={() => setEditing(true)} size='small' sx={{ opacity: 0.5 }}>
          <SvgIcon component={IconEdit} inheritViewBox />
        </IconButton>
      )}
    </Stack>
  );
}

export default React.memo(AddressRow);
