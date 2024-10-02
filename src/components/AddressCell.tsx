// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { alpha, Box, Chip, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import React from 'react';

import IconAddressBook from '@mimir-wallet/assets/svg/icon-address-book.svg?react';
import { useAccount, useAddressMeta, useToggle } from '@mimir-wallet/hooks';

import AddAddressDialog from './AddAddressDialog';
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
  withCopy = false
}: Props) {
  const [nameFontSize, addressFontSize, spacing, spacingCol] = ['0.875rem', '0.75rem', 0.5, 0.2];
  const [open, toggleOpen] = useToggle();

  const address = value?.toString();
  const { meta: { isMultisig, isProxied } = {} } = useAddressMeta(address);
  const { isLocalAccount, isLocalAddress } = useAccount();

  return (
    <>
      {address && <AddAddressDialog defaultAddress={address} onClose={toggleOpen} open={open} />}
      <Stack alignItems='center' className='AddressCell' direction='row' flex='1' spacing={spacing} width={width}>
        <IdentityIcon className='AddressCell-Icon' isMe={isMe} size={iconSize} value={value} />
        <Stack className='AddressCell-Address' spacing={spacingCol}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              component='span'
              fontSize={nameFontSize}
              fontWeight={700}
              sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              <AddressName defaultName={defaultName} value={value} />
            </Typography>
            {namePost}
            {showType && (
              <>
                {isMultisig && <Chip color='secondary' label='Multisig' size='small' />}
                {isProxied && (
                  <Chip
                    color='default'
                    sx={{ bgcolor: alpha('#B700FF', 0.05), color: '#B700FF' }}
                    label='Proxied'
                    size='small'
                  />
                )}
              </>
            )}
          </Box>
          <Typography
            color='text.secondary'
            component='span'
            fontSize={addressFontSize}
            sx={{ height: 18, display: 'flex', alignItems: 'center' }}
          >
            <AddressComp shorten={shorten} value={address} />
            {withCopy && <CopyButton size='small' sx={{ fontSize: 'inherit' }} value={address} />}
            {icons}
            {address && !isLocalAccount(address) && !isLocalAddress(address) && (
              <IconButton
                color='inherit'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOpen();
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
    </>
  );
}

export default React.memo(AddressCell);
