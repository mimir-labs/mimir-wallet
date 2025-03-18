// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProposalData } from '@/hooks/useProposals';

import { ellipsisMixin } from '@/components/utils';
import { Box, Paper, Stack, Typography } from '@mui/material';

import { chainLinks } from '@mimir-wallet/polkadot-core';
import { Chip, Link } from '@mimir-wallet/ui';

function Proposals({ data }: { data: ProposalData[] }) {
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
            <Link
              href={`/explorer/${encodeURIComponent(chainLinks.subsquareUrl(`referenda/${item.referendumIndex}`) || '')}`}
              underline='hover'
            >
              {item.title || `[${item.onchainData.trackInfo?.name}] Referendum #${item.referendumIndex}`}
            </Link>
          </Typography>
          <Box sx={{ width: '20%' }}>
            <Box component='img' src='/dapp-icons/subsquare.svg' sx={{ width: 30, height: 30 }} />
          </Box>
          <Chip color='secondary' size='sm'>
            {item.state.name}
          </Chip>
        </Box>
      ))}
    </Stack>
  );
}

export default Proposals;
