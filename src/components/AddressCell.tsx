// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { alpha, Box, Chip, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import { hexToU8a } from '@polkadot/util';
import React from 'react';

import IconAddressBook from '@mimir-wallet/assets/svg/icon-address-book.svg?react';
import { useAccount, useAddressMeta } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

import AddressComp from './Address';
import AddressName from './AddressName';
import CopyButton from './CopyButton';
import IdentityIcon from './IdentityIcon';

interface Props {
  defaultName?: string;
  value?: AccountId | AccountIndex | Address | string | null;
  iconSize?: number;
  shorten?: boolean;
  showType?: boolean;
  withCopy?: boolean;
  withAddressBook?: boolean;
  width?: number | string;
  isMe?: boolean;
  namePost?: React.ReactNode | null;
  icons?: React.ReactNode;
}

function AddressCell({
  defaultName,
  icons,
  isMe,
  namePost,
  shorten = true,
  showType = false,
  value,
  width,
  iconSize = 30,
  withCopy = false,
  withAddressBook = false
}: Props) {
  const [spacing, spacingCol] = [0.5, 0.2];

  const address = value?.toString();
  const { meta: { isMultisig, isProxied, isPure } = {} } = useAddressMeta(address);
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();

  return (
    <Stack alignItems='center' className='AddressCell' direction='row' flex='1' spacing={spacing} width={width}>
      <IdentityIcon className='AddressCell-Icon' isMe={isMe} size={iconSize} value={value} />
      <Stack className='AddressCell-Content' spacing={spacingCol}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            className='AddressCell-Name'
            component='span'
            fontSize='inherit'
            fontWeight={700}
            sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            <AddressName defaultName={defaultName} value={value} />
          </Typography>
          {namePost}
          {showType && (
            <>
              {isMultisig && <Chip color='secondary' label='Multisig' size='small' sx={{ fontSize: 12 }} />}
              {(isPure || isProxied) && (
                <Chip
                  color='default'
                  sx={{ bgcolor: alpha('#B700FF', 0.05), color: '#B700FF', fontSize: 12 }}
                  label={isPure ? 'Pure' : 'Proxied'}
                  size='small'
                />
              )}
            </>
          )}
        </Box>
        <Typography
          className='AddressCell-Address'
          color='text.secondary'
          component='span'
          fontSize='inherit'
          sx={{ height: 18, display: 'flex', alignItems: 'center', fontSize: '0.875em' }}
        >
          <AddressComp shorten={shorten} value={address} />
          {withCopy && <CopyButton size='small' sx={{ fontSize: 'inherit' }} value={address} />}
          {icons}
          {withAddressBook &&
            address &&
            !isLocalAccount(address) &&
            !isLocalAddress(address) &&
            !addressEq(hexToU8a('0x0', 256), address) && (
              <IconButton
                color='inherit'
                onClick={(e) => {
                  e.stopPropagation();
                  addAddressBook(address);
                }}
                size='small'
                sx={{ opacity: 0.7, fontSize: '0.8em' }}
              >
                <SvgIcon component={IconAddressBook} inheritViewBox />
              </IconButton>
            )}
        </Typography>
      </Stack>
    </Stack>
  );
}

export default React.memo(AddressCell);
