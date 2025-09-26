// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import Logo from '@/assets/images/logo.png';
import LogoCircle from '@/assets/svg/logo-circle.svg';
import { AccountSelect } from '@/components';
import { Link, useLocation } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';

import ChainSelect from '../chain-select';
import BatchButton from './BatchButton';
import NotificationButton from './NotificationButton';
import TemplateButton from './TemplateButton';
import WalletConnect from './WalletConnect';

function TopBar() {
  const { isApiReady } = useApi();
  const { pathname } = useLocation();
  const isInAppPage = pathname.startsWith('/explorer');

  return (
    <div className='bg-content1/70 border-secondary sticky top-0 z-50 flex h-[56px] w-full items-center justify-between gap-2 border-b px-4 backdrop-blur-lg backdrop-saturate-150 sm:gap-2.5 sm:px-6'>
      <div className='flex items-center gap-2'>
        <Link to='/'>
          <img className='hidden sm:block' alt='Mimir' src={Logo} style={{ width: 87 }} />
          <img className='block sm:hidden' alt='Mimir' src={LogoCircle} style={{ width: 32 }} />
        </Link>
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
