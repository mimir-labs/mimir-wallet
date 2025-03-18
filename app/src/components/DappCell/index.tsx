// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@/config';
import type { Endpoint } from '@mimir-wallet/polkadot-core';

import IconStar from '@/assets/svg/icon-star.svg?react';
import { ellipsisLinesMixin } from '@/components/utils';
import { useToggle } from '@/hooks/useToggle';
import { alpha, Avatar, Box, Button, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import React, { createElement, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Drawer, DrawerBody, DrawerContent } from '@mimir-wallet/ui';

import DappDetails from './DappDetails';
import SwitchChain from './SwitchChain';

interface Props {
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  dapp: DappOption;
}

function DappCell({ addFavorite, dapp, isFavorite, removeFavorite }: Props) {
  const { network } = useApi();
  const navigate = useNavigate();
  const [detailsOpen, toggleOpen, setDetailsOpen] = useToggle();
  const [isDrawerOpen, toggleDrawerOpen, setDrawerOpen] = useToggle();
  const [switchChain, setSwitchChain] = useState<string>();
  const [element, setElement] = useState<JSX.Element>();
  const _isFavorite = useMemo(() => isFavorite(dapp.id), [dapp.id, isFavorite]);
  const toggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (_isFavorite) {
        removeFavorite(dapp.id);
      } else {
        addFavorite(dapp.id);
      }
    },
    [_isFavorite, addFavorite, dapp.id, removeFavorite]
  );

  const openApp = useCallback(() => {
    setDetailsOpen(false);

    if (!dapp.isDrawer) {
      if (dapp.destChain?.[network]) {
        setSwitchChain(dapp.destChain[network]);
      } else {
        const url = dapp.urlSearch?.(network) || dapp.url;

        navigate(`/explorer/${encodeURIComponent(url.toString())}?network=${network}`);
      }
    } else {
      dapp.Component?.().then((C) => {
        setDrawerOpen(true);
        setElement(
          createElement(C, {
            onClose: () => setDrawerOpen(false)
          } as Record<string, unknown>)
        );
      });
    }
  }, [dapp, network, navigate, setDetailsOpen, setDrawerOpen]);

  const handleSwitchChain = useCallback(
    (endpoint: Endpoint) => {
      const url = dapp.urlSearch?.(endpoint.key) || dapp.url;

      window.location.href = `/explorer/${encodeURIComponent(url.toString())}?network=${endpoint.key}`;
    },
    [dapp]
  );

  return (
    <>
      <DappDetails dapp={dapp} onClose={toggleOpen} open={detailsOpen} onOpen={openApp} />

      {dapp.isDrawer && (
        <Drawer hideCloseButton placement='right' radius='none' isOpen={isDrawerOpen} onClose={toggleDrawerOpen}>
          <DrawerContent className='max-w-full w-auto py-5'>
            <DrawerBody>{element}</DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {switchChain && (
        <SwitchChain
          open={!!switchChain}
          network={switchChain}
          onClose={() => setSwitchChain(undefined)}
          onOpen={handleSwitchChain}
        />
      )}

      <Paper sx={{ cursor: 'pointer', display: 'block', padding: 2, textDecoration: 'none' }} onClick={openApp}>
        <Stack spacing={2}>
          <Box>
            <Typography variant='h4'>{dapp.name}</Typography>
            <Typography
              sx={{
                ...ellipsisLinesMixin(3),
                marginTop: 0.5,
                lineHeight: '14px',
                height: 42,
                fontSize: '0.75rem',
                color: 'text.secondary'
              }}
            >
              {dapp.description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: '1' }}>
              <Avatar variant='square' src={dapp.icon} sx={{ width: 32, height: 32 }} />
            </Box>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleOpen();
              }}
              variant='outlined'
            >
              Details
            </Button>
            <IconButton onClick={toggleFavorite} sx={({ palette }) => ({ bgcolor: alpha(palette.primary.main, 0.1) })}>
              <SvgIcon color='primary' component={IconStar} inheritViewBox sx={{ opacity: _isFavorite ? 1 : 0.2 }} />
            </IconButton>
          </Box>
        </Stack>
      </Paper>
    </>
  );
}

export default React.memo(DappCell);
