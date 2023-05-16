// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useMemo } from 'react';

import { AddressRow } from '@mimirdev/react-components';
import { getAddressMeta } from '@mimirdev/react-components/utils';
import { useSelectedAccount } from '@mimirdev/react-hooks';

function getAddressInfo(address?: string): [isMultisig: boolean, owners: string[]] {
  if (!address) return [false, []];

  const meta = getAddressMeta(address);

  return [!!meta.isMultisig, (meta.who as string[]) || []];
}

function Profile() {
  const selected = useSelectedAccount();
  const [isMultisig, owners] = useMemo(() => getAddressInfo(selected), [selected]);

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ padding: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <AddressRow size='large' value={selected} />
        {isMultisig && <Button variant='contained'>Export Config</Button>}
      </Paper>
      {isMultisig && (
        <Stack spacing={1.25}>
          <Typography fontWeight={700}>Owners</Typography>
          <Grid columns={{ xs: 12 }} container spacing={2.5}>
            {owners.map((address) => {
              return (
                <Grid key={address} lg={4} md={6} xs={12}>
                  <Paper sx={{ padding: 2.5, height: '100%' }}>
                    <AddressRow key={address} value={address} />
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      )}
    </Stack>
  );
}

export default Profile;
