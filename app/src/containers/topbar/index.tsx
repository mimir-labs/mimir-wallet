// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Logo from '@/assets/images/logo.png';
import IconArrowClockWise from '@/assets/svg/icon-arrow-clock-wise.svg?react';
import IconMenu from '@/assets/svg/icon-menu.svg?react';
import IconSetting from '@/assets/svg/icon-set.svg?react';
import LogoCircle from '@/assets/svg/logo-circle.svg';
import { AccountSelect } from '@/components';
import { useMimirLayout } from '@/hooks/useMimirLayout';
import { IconButton, Stack, SvgIcon } from '@mui/material';
import { useLocation } from 'react-router-dom';

import { useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Button, Link } from '@mimir-wallet/ui';

import ChainSelect from '../chain-select';
import BatchButton from './BatchButton';
import TemplateButton from './TemplateButton';

function TopBar() {
  const { isApiReady } = useApi();
  const { mode, setNetworkMode } = useNetworks();
  const { pathname } = useLocation();
  const { closeSidebar, openSidebar, sidebarOpen, rightSidebarOpen, openRightSidebar, closeRightSidebar } =
    useMimirLayout();
  const isInAppPage = pathname.startsWith('/explorer');

  return (
    <div
      className='z-50 sticky top-0 w-full flex items-center justify-between gap-2 sm:gap-2.5 px-4 sm:px-6 h-[56px] bg-content1'
      style={{
        boxShadow: 'inset 0px -1px 0px #E6F0FF'
      }}
    >
      <div className='flex items-center gap-2'>
        <Link href='/'>
          <img className='hidden sm:block' alt='Mimir' src={Logo} style={{ width: 87 }} />
          <img className='block sm:hidden' alt='Mimir' src={LogoCircle} style={{ width: 32 }} />
        </Link>
        <Button
          endContent={<IconArrowClockWise />}
          variant='solid'
          color='primary'
          size='sm'
          className='h-[18px]'
          onPress={() => {
            setNetworkMode(mode === 'solo' ? 'omni' : 'solo', () => window.location.reload());
          }}
        >
          <b className='uppercase'>{mode}</b>
        </Button>
      </div>

      <div className='flex items-center gap-2 sm:gap-5'>
        {isApiReady && isInAppPage && <AccountSelect />}
        {/* <Notification /> */}
        {isApiReady && <TemplateButton isOpen={rightSidebarOpen} open={openRightSidebar} close={closeRightSidebar} />}
        {isApiReady && <BatchButton />}
        <ChainSelect />
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
      </div>
    </div>
  );
}

export default TopBar;
