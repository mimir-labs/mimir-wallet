// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAccount } from '@/accounts/useAccount';
import { useQueryAccount } from '@/accounts/useQueryAccount';
import StatescanImg from '@/assets/images/statescan.svg';
import SubscanImg from '@/assets/images/subscan.svg';
import IconAdd from '@/assets/svg/icon-add-fill.svg?react';
import IconCancel from '@/assets/svg/icon-cancel.svg?react';
import IconProxy from '@/assets/svg/icon-proxy-fill.svg?react';
import IconQrcode from '@/assets/svg/icon-qr.svg?react';
import IconSend from '@/assets/svg/icon-send-fill.svg?react';
import IconSet from '@/assets/svg/icon-set.svg?react';
import { Address, AddressName, CopyButton, Fund, IdentityIcon, QrcodeAddress } from '@/components';
import { ONE_DAY } from '@/constants';
import { formatDisplay } from '@/utils';
import { Avatar, Box, Divider, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';

import { chainLinks, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Link, Tooltip } from '@mimir-wallet/ui';

function Hero({ address, totalUsd, changes }: { address: string; totalUsd: string; changes: number }) {
  const { chain } = useApi();
  const { isLocalAccount, isLocalAddress, addAddressBook } = useAccount();
  const [open, toggleOpen] = useToggle(false);
  const [qrOpen, toggleQrOpen] = useToggle(false);
  const [account] = useQueryAccount(address);
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  const showWatchOnlyButton = useMemo(
    () => !(isLocalAccount(address) || isLocalAddress(address, true)),
    [address, isLocalAccount, isLocalAddress]
  );
  const days = account ? Math.ceil((Date.now() - account.createdAt) / (ONE_DAY * 1000)) : '--';
  const formatUsd = formatDisplay(totalUsd);

  const buttons = (
    <div className='w-full sm:w-auto grid md:flex grid-cols-2 item-center gap-2'>
      <Button
        as={Link}
        href={`/explorer/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}`}
        variant='solid'
        color='primary'
        size='md'
        endContent={<IconSend />}
        className='h-[26px]'
      >
        Transfer
      </Button>
      {showWatchOnlyButton ? (
        <Button
          variant='ghost'
          color='primary'
          size='md'
          className='h-[26px]'
          endContent={<IconAdd className='w-4 h-4' />}
          onPress={() => addAddressBook(address, true)}
        >
          Add to watchlist
        </Button>
      ) : null}
      <Button
        onPress={toggleOpen}
        variant='ghost'
        color='primary'
        size='md'
        endContent={<IconCancel />}
        className='h-[26px]'
      >
        Fund
      </Button>
      <Button
        as={Link}
        href='/add-proxy'
        variant='ghost'
        color='primary'
        size='md'
        endContent={<IconProxy />}
        className='h-[26px]'
      >
        Proxy
      </Button>
      <Button
        as={Link}
        href='/extrinsic'
        variant='ghost'
        color='primary'
        size='md'
        endContent={<IconProxy />}
        className='h-[26px]'
      >
        Extrinsic
      </Button>
    </div>
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
              <Button isIconOnly as={Link} size='lg' href={`/account-setting?address=${address}`} color='secondary'>
                <IconSet className='w-[22px] h-[22px]' />
              </Button>
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
              <CopyButton value={address} color='primary' className='opacity-50' />
              <Button
                isIconOnly
                color='primary'
                size='sm'
                variant='light'
                onPress={toggleQrOpen}
                className='opacity-50 min-w-[26px] w-[26px] h-[26px] text-medium'
              >
                <IconQrcode className='w-[16px] h-[16px]' />
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <span>Mimir Secured {days} Days</span>
              <Tooltip content={window.currentChain.statescan ? 'Statescan' : 'Subscan'} closeDelay={0}>
                <Link target='_blank' href={chainLinks.accountExplorerLink(address)} rel='noreferrer'>
                  <Avatar
                    style={{ width: 16, height: 16 }}
                    src={window.currentChain.statescan ? StatescanImg : SubscanImg}
                    alt='subscan'
                  />
                </Link>
              </Tooltip>
              {chain.subsquareUrl && (
                <Tooltip content='Subsquare' closeDelay={0}>
                  <Link href={`/explorer/${encodeURIComponent(`${chain.subsquareUrl}user/${encodeAddress(address)}`)}`}>
                    <Avatar style={{ width: 16, height: 16 }} src='/dapp-icons/subsquare.svg' alt='subscan' />
                  </Link>
                </Tooltip>
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
