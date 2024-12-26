// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, IconButton, Stack, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Logo from '@mimir-wallet/assets/images/logo.png';
import IconMenu from '@mimir-wallet/assets/svg/icon-menu.svg?react';
import IconSetting from '@mimir-wallet/assets/svg/icon-set.svg?react';
import LogoCircle from '@mimir-wallet/assets/svg/logo-circle.svg';
import { AccountSelect, ChainSelect } from '@mimir-wallet/components';
import { useApi } from '@mimir-wallet/hooks/useApi';

import BatchButton from './BatchButton';
import { BaseContainerCtx } from './context';

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
        zIndex: 10,
        position: 'sticky',
        top: 0,
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
        <img
          alt=''
          src={isInAppPage && downSm ? LogoCircle : Logo}
          style={{ width: isInAppPage && downSm ? 32 : 87 }}
        />
      </Link>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: { sm: 2, xs: 1 } }}>
        {isApiReady && isInAppPage && <AccountSelect />}
        {/* <Notification /> */}
        {isApiReady && <BatchButton />}
        <ChainSelect onlyLogo={isInAppPage && downSm} />
        {isApiReady && (
          <Stack direction='row' display='none'>
            <IconButton color='secondary' size='large' sx={{ borderRadius: 1, border: '1px solid' }}>
              <SvgIcon color='primary' component={IconSetting} inheritViewBox />
            </IconButton>
          </Stack>
        )}

        <IconButton color='inherit' onClick={sidebarOpen ? closeSidebar : openSidebar} sx={{ display: { md: 'none' } }}>
          <SvgIcon component={IconMenu} inheritViewBox />
        </IconButton>
      </Box>
    </Box>
  );
}

export default TopBar;
