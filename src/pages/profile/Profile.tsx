// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { ReactComponent as IconSet } from '@mimirdev/assets/svg/icon-set.svg';
import { AddressCell } from '@mimirdev/components';
import { useSelectedAccount } from '@mimirdev/hooks';
import { getAddressMeta } from '@mimirdev/utils';

function Profile() {
  const selected = useSelectedAccount();
  const { isFlexible, isMultisig, who } = useMemo(() => (selected ? getAddressMeta(selected) : {}), [selected]);

  return (
    <Stack spacing={2}>
      <Paper sx={{ padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ flex: '1' }}>
          <AddressCell shorten={false} showType size='large' value={selected} withCopy />
        </Box>
        {isMultisig && <Button variant='contained'>Export Config</Button>}
        {isMultisig && isFlexible && (
          <Button component={Link} sx={{ minWidth: 0 }} to={`/account-setting/${selected}`} variant='outlined'>
            <SvgIcon component={IconSet} inheritViewBox />
          </Button>
        )}
      </Paper>
      {isMultisig && (
        <Stack spacing={1}>
          <Typography fontWeight={700}>Owners</Typography>
          <Box>
            <Grid columns={{ xs: 12 }} container spacing={2}>
              {who?.map((address) => {
                return (
                  <Grid key={address} lg={4} md={6} xs={12}>
                    <Paper sx={{ padding: 2, height: '100%' }}>
                      <AddressCell key={address} showType value={address} withCopy />
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Stack>
      )}
    </Stack>
  );
}

export default Profile;
