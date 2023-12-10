// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, IconButton, Stack, SvgIcon } from '@mui/material';
import { Link } from 'react-router-dom';

import Logo from '@mimirdev/assets/images/logo.png';
import { ReactComponent as IconSetting } from '@mimirdev/assets/svg/icon-set.svg';
import { useApi } from '@mimirdev/hooks';

function TopBar() {
  const { isApiReady } = useApi();

  return (
    <Box
      sx={{
        zIndex: 1,
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

      {isApiReady && (
        <Stack direction='row'>
          <IconButton color='secondary' size='large' sx={{ borderRadius: 1, border: '1px solid' }}>
            <SvgIcon color='primary' component={IconSetting} inheritViewBox />
          </IconButton>
        </Stack>
      )}
    </Box>
  );
}

export default TopBar;
