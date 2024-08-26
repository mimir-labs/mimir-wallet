// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box, Chip, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import IconAddressBook from '@mimir-wallet/assets/svg/icon-address-book.svg?react';
import { useAddressMeta, useToggle } from '@mimir-wallet/hooks';
import { isLocalAccount, isLocalAddress } from '@mimir-wallet/utils';

import AddAddressDialog from './AddAddressDialog';
import AddressComp from './Address';
import AddressName from './AddressName';
import CopyButton from './CopyButton';
import IdentityIcon from './IdentityIcon';

interface Props {
  value?: AccountId | AccountIndex | Address | string | null;
  size?: 'small' | 'medium' | 'large';
  shorten?: boolean;
  showType?: boolean;
  withCopy?: boolean;
  width?: number | string;
  isMe?: boolean;
  namePost?: React.ReactNode | null;
  icons?: React.ReactNode;
}

function AddressCell({
  icons,
  isMe,
  namePost,
  shorten = true,
  showType = false,
  size = 'medium',
  value,
  width,
  withCopy = false
}: Props) {
  const [iconSize, nameFontSize, addressFontSize, spacing, spacingCol] = useMemo((): [
    number,
    string,
    string,
    number,
    number
  ] => {
    return size === 'small'
      ? [30, '0.875rem', '0.75rem', 0.5, 0.2]
      : size === 'medium'
        ? [40, '1rem', '0.75rem', 0.5, 0.5]
        : [50, '1.25rem', '0.875rem', 1, 0.5];
  }, [size]);
  const [open, toggleOpen] = useToggle();

  const address = value?.toString();
  const { meta: { isFlexible, isMultisig, isTesting } = {} } = useAddressMeta(address);

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
              fontWeight={size === 'large' ? 800 : 700}
              sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              <AddressName value={value} />
            </Typography>
            {namePost}
            {showType &&
              (isMultisig ? (
                <Chip
                  color='secondary'
                  label={isFlexible ? 'Flexible' : 'Static'}
                  size={size === 'large' ? 'medium' : 'small'}
                />
              ) : isTesting ? (
                <Chip color='secondary' label='Dev' size={size === 'large' ? 'medium' : 'small'} />
              ) : null)}
          </Box>
          <Typography
            color='text.secondary'
            component='span'
            fontSize={addressFontSize}
            sx={{ height: 18, display: 'flex', alignItems: 'center' }}
          >
            <AddressComp shorten={shorten} value={address} />
            {withCopy && <CopyButton value={address} />}
            {icons}
            {!isLocalAccount(value) && !isLocalAddress(value) && (
              <IconButton
                color='inherit'
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOpen();
                }}
                size='small'
                sx={{ opacity: 0.7 }}
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
