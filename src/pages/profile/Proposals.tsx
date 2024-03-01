// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProposalData } from '@mimir-wallet/hooks';

import { ellipsisMixin } from '@mimir-wallet/components/utils';
import { chainLinks } from '@mimir-wallet/utils';
import { Box, Chip, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function Proposals({ data }: { data: Array<ProposalData> }) {
  return (
    <Stack component={Paper} padding={2} spacing={1} sx={{ bgcolor: 'common.white' }}>
      {data.slice(0, 3).map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            paddingX: 2,
            paddingY: 1,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'secondary.main',
            ':hover': { bgcolor: 'secondary.main' }
          }}
        >
          <Typography sx={{ flex: '1 0 auto', maxWidth: '60%', ...ellipsisMixin() }} variant='h6'>
            <span style={{ opacity: 0.5 }}>#{item.referendumIndex}</span>
            &nbsp;·&nbsp;
            <MuiLink color='inherit' component={Link} to={`/explorer/${encodeURIComponent(chainLinks.subsquareUrl(`referenda/${item.referendumIndex}`) || '')}`} underline='hover'>
              {item.title || `[${item.onchainData.trackInfo?.name}] Referendum #${item.referendumIndex}`}
            </MuiLink>
          </Typography>
          <Box sx={{ width: '20%' }}>
            <Box component='img' src='/dapp-icons/subsquare.svg' sx={{ width: 30, height: 30 }} />
          </Box>
          <Chip color='secondary' label={item.state.name} />
        </Box>
      ))}
    </Stack>
  );
}

export default Proposals;
