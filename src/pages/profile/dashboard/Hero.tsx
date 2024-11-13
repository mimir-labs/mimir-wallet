// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useToggle } from 'react-use';

import SubscanImg from '@mimir-wallet/assets/images/subscan.svg';
import IconAdd from '@mimir-wallet/assets/svg/icon-add-fill.svg?react';
import IconCancel from '@mimir-wallet/assets/svg/icon-cancel.svg?react';
import IconProxy from '@mimir-wallet/assets/svg/icon-proxy-fill.svg?react';
import IconQrcode from '@mimir-wallet/assets/svg/icon-qr.svg?react';
import IconSend from '@mimir-wallet/assets/svg/icon-send-fill.svg?react';
import IconSet from '@mimir-wallet/assets/svg/icon-set.svg?react';
import { Address, AddressName, Fund, IdentityIcon, QrcodeAddress } from '@mimir-wallet/components';
import { ONE_DAY } from '@mimir-wallet/constants';
import { useAccount, useApi, useQueryAccount } from '@mimir-wallet/hooks';
import { chainLinks, formatDisplay } from '@mimir-wallet/utils';

function Hero({ address, totalUsd, changes }: { address: string; totalUsd: string; changes: number }) {
  const { chain } = useApi();
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [open, toggleOpen] = useToggle(false);
  const [qrOpen, toggleQrOpen] = useToggle(false);
  const [account] = useQueryAccount(address);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const showWatchOnlyButton = useMemo(
    () => !isLocalAccount(address) && !isLocalAddress(address, true),
    [address, isLocalAccount, isLocalAddress]
  );
  const days = account ? Math.ceil((Date.now() - account.createdAt) / (ONE_DAY * 1000)) : '--';
  const formatUsd = formatDisplay(totalUsd);

  const buttons = (
    <Box
      sx={{
        width: { sm: 'auto', xs: '100%' },
        display: { sm: 'flex', xs: 'grid' },
        gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
        alignItems: 'center',
        gap: 1
      }}
    >
      <Button
        component={Link}
        to={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}`}
        variant='contained'
        color='primary'
        size='small'
        endIcon={<SvgIcon component={IconSend} inheritViewBox />}
        sx={{ height: 26, gridColumn: 'span 1 / span 1' }}
      >
        Transfer
      </Button>
      {showWatchOnlyButton ? (
        <Button
          variant='outlined'
          color='primary'
          size='small'
          sx={{ height: 26, gridColumn: 'span 1 / span 1' }}
          endIcon={<SvgIcon component={IconAdd} inheritViewBox />}
          onClick={() => addAddressBook(address, true)}
        >
          Add to watchlist
        </Button>
      ) : null}
      <Button
        onClick={toggleOpen}
        variant='outlined'
        color='primary'
        size='small'
        endIcon={<SvgIcon component={IconCancel} inheritViewBox />}
        sx={{ height: 26, gridColumn: 'span 1 / span 1' }}
      >
        Fund
      </Button>
      <Button
        component={Link}
        to='/add-proxy'
        variant='outlined'
        color='primary'
        size='small'
        endIcon={<SvgIcon component={IconProxy} inheritViewBox />}
        sx={{ height: 26, gridColumn: 'span 1 / span 1' }}
      >
        Proxy
      </Button>
    </Box>
  );

  return (
    <>
      <Paper
        sx={{
          width: '100%',
          padding: { sm: 2, xs: 1.5 },
          display: 'flex',
          flexDirection: { sm: 'row', xs: 'column' },
          alignItems: { sx: 'end', xs: 'start' },
          justifyContent: 'space-between',
          gap: 2,
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
          <IdentityIcon value={address} size={downSm ? 50 : 80} />

          <Stack spacing={{ sm: 1, xs: 0.5 }}>
            <Typography
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 800,
                fontSize: { sm: '30px', xs: '26px' },
                lineHeight: 1.1
              }}
            >
              <AddressName value={address} />
              <IconButton
                component={Link}
                to={`/account-setting/${address}`}
                color='primary'
                sx={{ bgcolor: 'secondary.main', fontSize: '1.2rem' }}
              >
                <SvgIcon component={IconSet} inheritViewBox />
              </IconButton>
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.1
              }}
            >
              <Address value={address} shorten={downSm} />
              <IconButton color='primary' onClick={toggleQrOpen} sx={{ padding: 0 }}>
                <SvgIcon component={IconQrcode} inheritViewBox sx={{ opacity: 0.5 }} />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <span>Mimir Secured {days} Days</span>
              <a target='_blank' href={chainLinks.accountExplorerLink(address)} rel='noreferrer'>
                <Avatar style={{ width: 16, height: 16 }} src={SubscanImg} alt='subscan' />
              </a>
              {chain.subsquareUrl && (
                <Link to={`/explorer/${encodeURIComponent(chain.subsquareUrl)}`}>
                  <Avatar style={{ width: 16, height: 16 }} src='/dapp-icons/subsquare.svg' alt='subscan' />
                </Link>
              )}
            </Box>

            <Divider sx={{ display: { sm: 'block', xs: 'none' }, maxWidth: 250, minWidth: 200 }} />

            {!downSm && buttons}
          </Stack>
        </Box>

        <Box
          sx={{
            textAlign: { sm: 'right', xs: 'left' },
            background: { sm: 'transparent', xs: 'linear-gradient(245deg, #F4F2FF 0%, #FBFDFF 100%)' },
            width: { sm: 'auto', xs: '100%' },
            borderRadius: 2,
            padding: { sm: 0, xs: 1 }
          }}
        >
          <Typography variant='h1' sx={{ fontWeight: 700, fontSize: '40px', lineHeight: 1 }}>
            $ {formatUsd[0]}
            {formatUsd[1] ? `.${formatUsd[1]}` : ''}
            {formatUsd[2] || ''}
          </Typography>
          <Typography
            sx={{
              marginTop: 1,
              fontWeight: 700,
              fontSize: '1rem'
            }}
          >
            <Box
              component='span'
              sx={{
                marginRight: 0.5,
                color: changes >= 0 ? 'success.main' : 'error.main'
              }}
            >
              {(changes * 100).toFixed(2)}%
            </Box>
            <span style={{ fontWeight: 400 }}>Last 24 Hours</span>
          </Typography>
        </Box>

        {downSm && buttons}
      </Paper>

      <Fund onClose={toggleOpen} open={open} receipt={address} />
      <QrcodeAddress open={qrOpen} onClose={toggleQrOpen} value={address} />
    </>
  );
}

export default React.memo(Hero);
