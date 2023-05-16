// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DappOption } from '@mimirdev/app-config/types';

import { Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ellipsisLinesMixin } from '@mimirdev/react-components/utils';

interface Props {
  dapp: DappOption;
}

function DappCell({ dapp }: Props) {
  const navigate = useNavigate();

  const onClick = () => {
    if (dapp.internal) {
      navigate(dapp.url);
    } else {
      navigate(`/dapp/${encodeURIComponent(dapp.url)}`);
    }
  };

  return (
    <Paper onClick={onClick} sx={{ paddingX: 2.5, height: 120, display: 'flex', alignItems: 'center', gap: 2.5, cursor: 'pointer' }}>
      <img alt={dapp.name} src={dapp.icon} width={50} />
      <Stack spacing={0.5}>
        <Typography fontWeight={700}>{dapp.name}</Typography>
        <Typography color='text.secondary' fontSize={12} sx={{ wordBreak: 'break-word', ...ellipsisLinesMixin(3) }}>
          {dapp.description}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default React.memo(DappCell);
