// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import { isArray } from '@polkadot/util';
import React from 'react';
import { Link } from 'react-router-dom';

import IconDiscord from '@mimir-wallet/assets/svg/icon-discord.svg?react';
import IconGithub from '@mimir-wallet/assets/svg/icon-github.svg?react';
import IconWebsite from '@mimir-wallet/assets/svg/icon-website.svg?react';
import IconX from '@mimir-wallet/assets/svg/icon-x.svg?react';
import { type DappOption, findToken } from '@mimir-wallet/config';

interface Props {
  open: boolean;
  dapp: DappOption;
  onClose: () => void;
}

function SupportedChains({ supported }: { supported: string[] | true }) {
  return (
    <Box sx={{ position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center' }}>
      <Typography marginRight={1}>Supported on</Typography>
      {isArray(supported)
        ? supported.map((genesisHash) => (
            <Avatar
              key={genesisHash}
              src={findToken(genesisHash).Icon}
              sx={{ width: 16, height: 16, marginLeft: '-4px' }}
            />
          ))
        : 'All Chains'}
    </Box>
  );
}

function Contents({ dapp }: { dapp: DappOption }) {
  return (
    <DialogContent>
      <Stack spacing={1} sx={{ position: 'relative' }}>
        <SupportedChains supported={dapp.supportedChains} />
        <Box component='img' src={dapp.icon} sx={{ width: 64, height: 64 }} />
        <Typography variant='h3'>{dapp.name}</Typography>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, '>.MuiIconButton-root': { bgcolor: 'secondary.main' } }}
        >
          {dapp.tags.map((tag, index) => (
            <Button color='secondary' key={index} size='small' sx={{ fontWeight: 500 }}>
              {tag}
            </Button>
          ))}
          <Divider orientation='vertical' sx={{ height: 12 }} />
          {dapp.website && (
            <IconButton color='primary' component='a' href={dapp.website} size='small' target='_blank'>
              <SvgIcon component={IconWebsite} inheritViewBox />
            </IconButton>
          )}
          {dapp.github && (
            <IconButton color='primary' component='a' href={dapp.github} size='small' target='_blank'>
              <SvgIcon component={IconGithub} inheritViewBox />
            </IconButton>
          )}
          {dapp.discord && (
            <IconButton color='primary' component='a' href={dapp.discord} size='small' target='_blank'>
              <SvgIcon component={IconDiscord} inheritViewBox />
            </IconButton>
          )}
          {dapp.twitter && (
            <IconButton color='primary' component='a' href={dapp.twitter} size='small' target='_blank'>
              <SvgIcon component={IconX} inheritViewBox />
            </IconButton>
          )}
        </Box>
        <Typography fontWeight={500} variant='h6'>
          {dapp.description}
        </Typography>
      </Stack>
    </DialogContent>
  );
}

function DappDetails({ dapp, onClose, open }: Props) {
  return (
    <Dialog fullWidth maxWidth='sm' onClose={onClose} open={open}>
      <Contents dapp={dapp} />
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          component={Link}
          size='large'
          sx={{ width: 195 }}
          to={dapp.internal ? dapp.url : `/explorer/${encodeURIComponent(dapp.url)}`}
        >
          Open
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(DappDetails);
