// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { analyticsActions } from '@/analytics';
import Logo from '@/assets/images/logo.png';
import IconArrowClockWise from '@/assets/svg/icon-arrow-clock-wise.svg?react';
import LogoCircle from '@/assets/svg/logo-circle.svg';
import { AccountSelect } from '@/components';
import { Link, useLocation } from 'react-router-dom';

import { useApi, useNetworks } from '@mimir-wallet/polkadot-core';
import { Button } from '@mimir-wallet/ui';

import ChainSelect from '../chain-select';
import BatchButton from './BatchButton';
import NotificationButton from './NotificationButton';
import TemplateButton from './TemplateButton';
import WalletConnect from './WalletConnect';

function TopBar() {
  const { isApiReady } = useApi();
  const { mode, setNetworkMode } = useNetworks();
  const { pathname } = useLocation();
  const isInAppPage = pathname.startsWith('/explorer');

  return (
    <div className='bg-content1/70 border-secondary sticky top-0 z-50 flex h-[56px] w-full items-center justify-between gap-2 border-b px-4 backdrop-blur-lg backdrop-saturate-150 sm:gap-2.5 sm:px-6'>
      <div className='flex items-center gap-2'>
        <Link to='/'>
          <img className='hidden sm:block' alt='Mimir' src={Logo} style={{ width: 87 }} />
          <img className='block sm:hidden' alt='Mimir' src={LogoCircle} style={{ width: 32 }} />
        </Link>
        <Button
          variant='solid'
          color='primary'
          size='sm'
          className='h-[18px]'
          onClick={() => {
            setNetworkMode(mode === 'solo' ? 'omni' : 'solo', () => window.location.reload());
            analyticsActions.omniSolochain(mode === 'solo' ? 'omni' : 'solo');
          }}
        >
          <b className='uppercase'>{mode}</b>
          <IconArrowClockWise />
        </Button>
      </div>

      <div className='flex items-center gap-2 sm:gap-5'>
        {isApiReady && isInAppPage && <AccountSelect />}
        {/* <Notification /> */}
        {isApiReady && <NotificationButton />}
        {isApiReady && <WalletConnect />}
        {isApiReady && <TemplateButton />}
        {isApiReady && <BatchButton />}
        <ChainSelect />
      </div>
    </div>
  );
}

export default TopBar;
