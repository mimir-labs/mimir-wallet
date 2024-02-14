// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProposalData } from '@mimir-wallet/hooks';

import { chainLinks } from '@mimir-wallet/utils';
import { Box, Chip, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';

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
            paddingX: 2,
            paddingY: 1,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'secondary.main',
            ':hover': { bgcolor: 'secondary.main' }
          }}
        >
          <Typography variant='h6'>
            <span style={{ opacity: 0.5 }}>#{item.referendumIndex}</span>
            &nbsp;·&nbsp;
            <MuiLink color='inherit' href={chainLinks.subsquareUrl(`referenda/${item.referendumIndex}`)} target='_blank' underline='hover'>
              {item.title || `[${item.onchainData.trackInfo?.name}] Referendum #${item.referendumIndex}`}
            </MuiLink>
          </Typography>
          <Chip color='secondary' label={item.state.name} />
        </Box>
      ))}
    </Stack>
  );
}

export default Proposals;
