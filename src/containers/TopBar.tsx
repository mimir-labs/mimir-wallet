// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Logo from '@mimir-wallet/assets/images/logo.png';
import { ReactComponent as IconMenu } from '@mimir-wallet/assets/svg/icon-menu.svg';
import { ReactComponent as IconSetting } from '@mimir-wallet/assets/svg/icon-set.svg';
import LogoCircle from '@mimir-wallet/assets/svg/logo-circle.svg';
import { AccountSelect, ChainSelect } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks';
import { Box, IconButton, Stack, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { BaseContainerCtx } from './BaseContainer';

function TopBar() {
  const { isApiReady } = useApi();
  const { pathname } = useLocation();
  const { closeSidebar, openSidebar, sidebarOpen } = useContext(BaseContainerCtx);
  const isInAppPage = pathname.startsWith('/explorer');
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  return (
    <Box
      sx={{
        zIndex: 1,
        position: 'fixed',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        px: { sm: 2.5, xs: 2 },
        height: 56,
        bgcolor: 'background.default',
        boxShadow: 'inset 0px -1px 0px #E6F0FF'
      }}
    >
      <Link to='/'>
        <img src={isInAppPage && downSm ? LogoCircle : Logo} style={{ width: isInAppPage && downSm ? 32 : 87 }} />
      </Link>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: { sm: 2, xs: 1 } }}>
        {isApiReady && <>{isInAppPage && <AccountSelect />}</>}
        <ChainSelect onlyLogo={isInAppPage && downSm} />
        {isApiReady && (
          <>
            <Stack direction='row' display='none'>
              <IconButton color='secondary' size='large' sx={{ borderRadius: 1, border: '1px solid' }}>
                <SvgIcon color='primary' component={IconSetting} inheritViewBox />
              </IconButton>
            </Stack>
          </>
        )}

        <IconButton color='inherit' onClick={sidebarOpen ? closeSidebar : openSidebar} sx={{ display: { md: 'none' } }}>
          <SvgIcon component={IconMenu} inheritViewBox />
        </IconButton>
      </Box>
    </Box>
  );
}

export default TopBar;
