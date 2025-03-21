// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Logo from '@/assets/images/logo.png';
import IconMenu from '@/assets/svg/icon-menu.svg?react';
import IconSetting from '@/assets/svg/icon-set.svg?react';
import LogoCircle from '@/assets/svg/logo-circle.svg';
import { AccountSelect, ChainSelect } from '@/components';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import { Box, IconButton, Stack, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';
import { Link } from '@mimir-wallet/ui';

import BatchButton from './BatchButton';
import TemplateButton from './TemplateButton';

function TopBar() {
  const { isApiReady } = useApi();
  const { pathname } = useLocation();
  const { closeSidebar, openSidebar, sidebarOpen, rightSidebarOpen, openRightSidebar, closeRightSidebar } =
    useMimirLayout();
  const isInAppPage = pathname.startsWith('/explorer');
  const { breakpoints } = useTheme();
  const downSm = useMediaQuery(breakpoints.down('sm'));

  return (
    <Box
      sx={{
        zIndex: 50,
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
      <Link href='/'>
        <img
          alt=''
          src={isInAppPage && downSm ? LogoCircle : Logo}
          style={{ width: isInAppPage && downSm ? 32 : 87 }}
        />
      </Link>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: { sm: 2, xs: 1 } }}>
        {isApiReady && isInAppPage && <AccountSelect />}
        {/* <Notification /> */}
        {isApiReady && <TemplateButton isOpen={rightSidebarOpen} open={openRightSidebar} close={closeRightSidebar} />}
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
