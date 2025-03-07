// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProposalData } from '@/hooks/useProposals';

import { chainLinks } from '@/api/chain-links';
import { ellipsisMixin } from '@/components/utils';
import { Box, Chip, Link as MuiLink, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

function Proposals({ data }: { data: ProposalData[] }) {
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  return (
    <Stack component={Paper} padding={{ sm: 2, xs: 1 }} spacing={1} sx={{ bgcolor: 'common.white' }}>
      {data.slice(0, 3).map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { sm: 2, xs: 1 },
            paddingX: { sm: 2, xs: 1 },
            paddingY: 1,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'secondary.main',
            ':hover': { bgcolor: 'secondary.main' }
          }}
        >
          <Typography
            sx={{ flex: '1 0 auto', maxWidth: '60%', fontSize: { sm: '1rem', xs: '0.875rem' }, ...ellipsisMixin() }}
            variant='h6'
          >
            <span style={{ opacity: 0.5 }}>#{item.referendumIndex}</span>
            &nbsp;·&nbsp;
            <MuiLink
              color='inherit'
              component={Link}
              to={`/explorer/${encodeURIComponent(chainLinks.subsquareUrl(`referenda/${item.referendumIndex}`) || '')}`}
              underline='hover'
            >
              {item.title || `[${item.onchainData.trackInfo?.name}] Referendum #${item.referendumIndex}`}
            </MuiLink>
          </Typography>
          <Box sx={{ width: '20%' }}>
            <Box component='img' src='/dapp-icons/subsquare.svg' sx={{ width: 30, height: 30 }} />
          </Box>
          <Chip color='secondary' label={item.state.name} size={downSm ? 'small' : 'medium'} />
        </Box>
      ))}
    </Stack>
  );
}

export default Proposals;
