// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactComponent as IconSet } from '@mimir-wallet/assets/svg/icon-set.svg';
import { AddressCell, AddressOverview, Fund } from '@mimir-wallet/components';
import { useAddressMeta, useSelectedAccount, useToggle } from '@mimir-wallet/hooks';
import { Box, Button, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function Profile() {
  const selected = useSelectedAccount();
  const {
    meta: { isFlexible, isMultisig }
  } = useAddressMeta(selected);
  const [open, toggleOpen] = useToggle();

  return (
    <>
      <Stack spacing={2}>
        <Paper sx={{ padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: '1' }}>
            <AddressCell shorten={false} showType size='large' value={selected} withCopy />
          </Box>
          {isMultisig && (
            <>
              <Fund onClose={toggleOpen} open={open} receipt={selected} />
              <Button onClick={toggleOpen} variant='contained'>
                Fund
              </Button>
            </>
          )}
          {isMultisig && isFlexible && (
            <Button component={Link} sx={{ minWidth: 0 }} to={`/account-setting/${selected}`} variant='outlined'>
              <SvgIcon component={IconSet} inheritViewBox />
            </Button>
          )}
        </Paper>
        {isMultisig && (
          <Stack spacing={1}>
            <Typography fontWeight={700}>Members</Typography>
            <Paper sx={{ width: '100%', height: '40vh', borderRadius: 2 }}>
              <AddressOverview key={selected} value={selected} />
            </Paper>
          </Stack>
        )}
      </Stack>
    </>
  );
}

export default Profile;
