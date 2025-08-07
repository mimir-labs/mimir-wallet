// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconWalletConnect from '@/assets/svg/icon-wallet-connect.svg?react';
import { WalletConnectContext, WalletConnectModal } from '@/features/wallet-connect';
import { useContext } from 'react';
import { useToggle } from 'react-use';

import { Avatar, Button, Tooltip } from '@mimir-wallet/ui';

const apps = [
  {
    name: 'Hydration',
    url: 'https://app.hydration.net/',
    icon: 'https://hydration.net/favicon.ico'
  },
  {
    name: 'Polkadot Developer Console',
    url: 'https://console.polkadot.cloud/',
    icon: 'https://console.polkadot.cloud/favicons/apple-touch-icon.png'
  },
  {
    name: 'Polkadot Staking Dashboard',
    url: 'https://staking.polkadot.cloud/#/overview',
    icon: 'https://staking.polkadot.cloud/favicons/favicon.ico'
  }
];

function WalletConnectExample() {
  const { isReady } = useContext(WalletConnectContext);
  const [isOpen, toggleOpen] = useToggle(false);

  return (
    <>
      <div className='border-secondary bg-background shadow-medium flex w-full flex-col items-center justify-between gap-3 rounded-[20px] border-1 p-5 sm:flex-row'>
        <div className='flex flex-1 items-center gap-2.5'>
          <Avatar src='/images/wallet-connect.webp' style={{ width: 40, height: 40 }} className='flex-shrink-0' />
          <div>
            <div className='flex items-center gap-1.5'>
              <b className='mr-1 text-base'>Login as Multisig</b>
              {apps.map((app) => (
                <Tooltip color='foreground' content={app.name} key={app.name}>
                  <a href={app.url} target='_blank' rel='noopener noreferrer'>
                    <img alt={app.name} src={app.icon} className='h-4 w-4 rounded-full' />
                  </a>
                </Tooltip>
              ))}
            </div>
            <p className='text-divider-300 mt-1 text-xs'>
              Connect to any other Dapp supports wallet connect. And also you can connect to Mimir.
            </p>
          </div>
        </div>
        <Button color='primary' radius='full' onClick={toggleOpen} className='w-full sm:w-auto'>
          Connect to Dapp
          <div className='bg-primary-foreground text-primary h-4 w-4 rounded-full p-0.5'>
            <IconWalletConnect style={{ width: 12, height: 12 }} />
          </div>
        </Button>
      </div>

      {isReady && <WalletConnectModal isOpen={isOpen} onClose={toggleOpen} />}
    </>
  );
}

export default WalletConnectExample;
