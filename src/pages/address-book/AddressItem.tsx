// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, IconButton, Paper, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import { useAddressMeta } from '@mimir-wallet/accounts/useAddressMeta';
import { chainLinks } from '@mimir-wallet/api/chain-links';
import IconLink from '@mimir-wallet/assets/svg/icon-link.svg?react';
import IconQr from '@mimir-wallet/assets/svg/icon-qr.svg?react';
import IconSend from '@mimir-wallet/assets/svg/icon-send-fill.svg?react';
import { AddressCell, AddressRow, CopyButton, EditAddressDialog, QrcodeAddress } from '@mimir-wallet/components';
import { useToggle } from '@mimir-wallet/hooks/useToggle';

function Icons({ address }: { address: string }) {
  const [qrOpen, toggleQrOpen] = useToggle();

  return (
    <>
      <QrcodeAddress onClose={toggleQrOpen} open={qrOpen} value={address} />
      <CopyButton color='primary' size='small' value={address} />
      <IconButton color='primary' size='small' onClick={toggleQrOpen}>
        <SvgIcon component={IconQr} inheritViewBox />
      </IconButton>
      <IconButton
        color='primary'
        component='a'
        href={chainLinks.accountExplorerLink(address)}
        size='small'
        target='_blank'
      >
        <SvgIcon component={IconLink} inheritViewBox />
      </IconButton>
    </>
  );
}

function AddressItem({ address }: { address: string }) {
  const [open, toggleOpen] = useToggle();
  const { meta } = useAddressMeta(address);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));
  const downMd = useMediaQuery(breakpoints.down('md'));

  return (
    <>
      <EditAddressDialog address={address} onClose={toggleOpen} open={open} />

      {downSm && (
        <Paper
          sx={{
            borderRadius: '20px',
            padding: 1.5,
            boxShadow: '0px 0px 10px rgba(21, 31, 52, 0.06)',
            '.AddressCell-Content': {
              marginLeft: 1
            },
            '.AddressCell-Name': {
              fontSize: '1.125rem'
            },
            '.AddressCell-Address': {
              marginTop: 1,
              fontSize: '0.875rem'
            }
          }}
        >
          <AddressCell iconSize={50} icons={<Icons address={address} />} shorten value={address} withCopy={false} />
          <Box sx={{ display: 'flex', gap: 1, marginTop: 2 }}>
            <Button size='small' onClick={toggleOpen} variant='outlined' sx={{ marginLeft: 6 }}>
              Edit
            </Button>
            <Button
              size='small'
              component={Link}
              endIcon={<SvgIcon component={IconSend} inheritViewBox />}
              to={`/transfer?to=${address}`}
            >
              Send
            </Button>
          </Box>
        </Paper>
      )}
      {!downSm && (
        <Paper
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            borderRadius: '20px',
            padding: 2.5,
            boxShadow: '0px 0px 10px rgba(21, 31, 52, 0.06)'
          }}
        >
          <Box sx={{ flex: '1', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='h6'>{meta?.name}</Typography>
          </Box>
          <Box
            sx={{ flex: '3', display: 'flex', alignItems: 'center', gap: 0.5, '>.MuiIconButton-root': { padding: 0 } }}
          >
            <AddressRow shorten={downMd} value={address} withAddress withName={false} />
            <Icons address={address} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={toggleOpen} variant='outlined'>
              Edit
            </Button>
            <Button
              component={Link}
              endIcon={<SvgIcon component={IconSend} inheritViewBox />}
              to={`/transfer?to=${address}`}
            >
              Send
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
}

export default React.memo(AddressItem);
