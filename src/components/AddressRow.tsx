// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box, IconButton, Stack, SvgIcon } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { useAddressMeta } from '@mimir-wallet/accounts/useAddressMeta';
import { encodeAddress } from '@mimir-wallet/api';
import IconEdit from '@mimir-wallet/assets/svg/icon-edit.svg?react';

import AddressComp from './Address';
import AddressName from './AddressName';
import CopyButton from './CopyButton';
import IdentityIcon from './IdentityIcon';

interface Props {
  defaultName?: string;
  value?: AccountId | AccountIndex | Address | Uint8Array | string | null;
  shorten?: boolean;
  iconSize?: number;
  withAddress?: boolean;
  withCopy?: boolean;
  withName?: boolean;
  withEdit?: boolean;
  onClick?: (value?: string) => void;
}

function EditName({
  address,
  onDone
}: {
  onDone: () => void;
  address?: AccountId | AccountIndex | Address | string | null;
}) {
  const { name, saveName, setName } = useAddressMeta(encodeAddress(address));

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

function AddressRow({
  defaultName,
  onClick,
  shorten,
  value,
  iconSize,
  withAddress = false,
  withCopy = false,
  withEdit,
  withName = true
}: Props) {
  const [editing, setEditing] = useState(false);

  const address = useMemo(() => encodeAddress(value), [value]);

  const _onClick = useCallback(() => {
    onClick?.(address);
  }, [onClick, address]);

  return (
    <Stack
      alignItems='center'
      className='AddressRow'
      direction='row'
      onClick={_onClick}
      spacing={0.5}
      sx={{ cursor: onClick ? 'pointer' : undefined }}
    >
      <IdentityIcon className='AddressRow-Icon' size={iconSize} value={address} />
      {withName && (
        <Box component='span' sx={{ fontWeight: withName && withAddress ? 700 : undefined }}>
          {editing ? (
            <EditName address={address} onDone={() => setEditing(false)} />
          ) : (
            <AddressName defaultName={defaultName} value={address} />
          )}
        </Box>
      )}
      {withAddress && (
        <Box component='span'>
          <AddressComp shorten={shorten} value={address} />
        </Box>
      )}
      {withCopy && <CopyButton value={address} />}
      {withEdit && (
        <IconButton color='inherit' onClick={() => setEditing(true)} size='small' sx={{ opacity: 0.5 }}>
          <SvgIcon component={IconEdit} inheritViewBox />
        </IconButton>
      )}
    </Stack>
  );
}

export default React.memo(AddressRow);
