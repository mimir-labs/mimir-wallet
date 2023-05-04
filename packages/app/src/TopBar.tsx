// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { Logo } from '@mimirdev/app-config/images';

import ChainSelect from './ChainSelect';

function TopBar() {
  return (
    <Box
      sx={{
        position: 'fixed',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2.5,
        height: 56,
        bgcolor: 'background.default',
        boxShadow: 'inset 0px -1px 0px #E6F0FF'
      }}
    >
      <Link to='/'>
        <img src={Logo} style={{ width: 87 }} />
      </Link>

      <Stack>
        <ChainSelect />
      </Stack>
    </Box>
  );
}

export default TopBar;
