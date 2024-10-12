// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { chainLinks } from '@mimir-wallet/utils';

interface Props {
  info: React.ReactNode;
  transaction?: React.ReactNode;
  assets?: React.ReactNode;
  dapps?: React.ReactNode | null;
  member?: React.ReactNode;
  proposals?: React.ReactNode | null;
}

function ProfileWrapper({ assets, dapps, info, member, proposals, transaction }: Props) {
  const url = chainLinks.subsquareUrl();

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', flexDirection: { lg: 'row', xs: 'column' }, gap: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: { lg: '59%', xs: '100%' } }}>
          <Typography marginBottom={0.5} variant='h6'>
            Info
          </Typography>
          {info}
        </Box>

        <Box sx={{ width: { lg: '41%', xs: '100%' } }}>
          <Typography
            marginBottom={0.5}
            variant='h6'
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            Pending Transactions
            <Button component={Link} to='/transactions' size='small' variant='text'>
              View More
            </Button>
          </Typography>
          {transaction}
        </Box>
      </Box>

      <Box>
        <Typography marginBottom={0.5} variant='h6'>
          Assets
        </Typography>
        {assets}
      </Box>

      {proposals && (
        <Box>
          <Typography marginBottom={0.5} variant='h6'>
            Latest proposals
            {url && (
              <MuiLink
                color='primary.main'
                component={Link}
                style={{ float: 'right' }}
                to={`/explorer/${encodeURIComponent(url)}`}
                underline='none'
              >
                View More
              </MuiLink>
            )}
          </Typography>
          {proposals}
        </Box>
      )}

      {dapps && (
        <Box>
          <Typography marginBottom={0.5} sx={{ display: 'flex', justifyContent: 'space-between' }} variant='h6'>
            Favorite Apps
            <MuiLink component={Link} to='/dapp' underline='none'>
              View More
            </MuiLink>
          </Typography>
          {dapps}
        </Box>
      )}

      <Box>
        {member && (
          <Typography marginBottom={0.5} variant='h6'>
            Relation
          </Typography>
        )}
        {member}
      </Box>
    </Stack>
  );
}

export default ProfileWrapper;
