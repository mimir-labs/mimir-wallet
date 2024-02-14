// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@mimir-wallet/config';

import { ReactComponent as IconStar } from '@mimir-wallet/assets/svg/icon-star.svg';
import { ellipsisLinesMixin } from '@mimir-wallet/components/utils';
import { useToggle } from '@mimir-wallet/hooks';
import { alpha, Box, Button, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';

import DappDetails from './DappDetails';

interface Props {
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  dapp: DappOption;
}

function DappCell({ addFavorite, dapp, isFavorite, removeFavorite }: Props) {
  const [detailsOpen, toggleOpen] = useToggle();
  const _isFavorite = useMemo(() => isFavorite(dapp.id), [dapp.id, isFavorite]);
  const toggleFavorite = useCallback(() => {
    if (_isFavorite) {
      removeFavorite(dapp.id);
    } else {
      addFavorite(dapp.id);
    }
  }, [_isFavorite, addFavorite, dapp.id, removeFavorite]);

  return (
    <>
      <DappDetails dapp={dapp} onClose={toggleOpen} open={detailsOpen} />
      <Paper onClick={toggleOpen} sx={{ cursor: 'pointer', display: 'block', padding: 2, textDecoration: 'none' }}>
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
              <Box component='img' src={dapp.icon} sx={{ width: 32, height: 32 }} />
            </Box>
            <Button component={Link} onClick={(e) => e.stopPropagation()} to={dapp.internal ? dapp.url : `/explorer/${encodeURIComponent(dapp.url)}`} variant='outlined'>
              Enter
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
