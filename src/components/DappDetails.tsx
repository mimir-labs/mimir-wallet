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

import IconMatrix from '@mimir-wallet/assets/images/matrix.svg?react';
import IconDiscord from '@mimir-wallet/assets/svg/icon-discord.svg?react';
import IconGithub from '@mimir-wallet/assets/svg/icon-github.svg?react';
import IconWebsite from '@mimir-wallet/assets/svg/icon-website.svg?react';
import IconX from '@mimir-wallet/assets/svg/icon-x.svg?react';
import { type DappOption, findEndpoint } from '@mimir-wallet/config';

interface Props {
  open: boolean;
  dapp: DappOption;
  onClose: () => void;
  onOpen: () => void;
}

function SupportedChains({ supported }: { supported: string[] | true }) {
  return (
    <Box sx={{ position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center' }}>
      <Typography marginRight={1}>Supported on</Typography>
      {isArray(supported)
        ? supported.map((genesisHash) => (
            <Avatar
              key={genesisHash}
              src={findEndpoint(genesisHash)?.icon}
              sx={{
                width: 16,
                height: 16,
                marginLeft: '-4px',
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'background.default'
              }}
            />
          ))
        : 'All Chains'}
    </Box>
  );
}

function Contents({ dapp }: { dapp: DappOption }) {
  return (
    <DialogContent>
      <Stack spacing={1} sx={{ position: 'relative', overflow: 'hidden' }}>
        <SupportedChains supported={dapp.supportedChains} />
        <Avatar src={dapp.icon} sx={{ width: 64, height: 64 }} />
        <Typography variant='h3'>{dapp.name}</Typography>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, '>.MuiIconButton-root': { bgcolor: 'secondary.main' } }}
        >
          {dapp.tags?.map((tag, index) => (
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
          {dapp.matrix && (
            <IconButton color='primary' component='a' href={dapp.matrix} size='small' target='_blank'>
              <SvgIcon component={IconMatrix} inheritViewBox />
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

function DappDetails({ dapp, onClose, onOpen, open }: Props) {
  return (
    <Dialog fullWidth maxWidth='sm' onClose={onClose} open={open}>
      <Contents dapp={dapp} />
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button size='large' sx={{ width: 195 }} onClick={onOpen}>
          Open
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default React.memo(DappDetails);
