// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Typography } from '@mui/material';

interface Props {
  info: React.ReactNode;
  transaction?: React.ReactNode;
  assets?: React.ReactNode;
  member?: React.ReactNode;
}

function ProfileWrapper({ assets, info, member, transaction }: Props) {
  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ width: '59%' }}>
          <Typography marginBottom={0.5} variant='h6'>
            Info
          </Typography>
          {info}
        </Box>
        <Box sx={{ width: '41%' }}>
          <Typography marginBottom={0.5} variant='h6'>
            Pending Transactions
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
      <Box>
        {member && (
          <Typography marginBottom={0.5} variant='h6'>
            Members
          </Typography>
        )}
        {member}
      </Box>
    </Stack>
  );
}

export default ProfileWrapper;
