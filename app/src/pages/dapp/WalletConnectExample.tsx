// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconWalletConnect from '@/assets/svg/icon-wallet-connect.svg?react';
import { WalletConnectContext, WalletConnectModal } from '@/features/wallet-connect';
import { useContext } from 'react';
import { useToggle } from 'react-use';

import { Avatar, Button, Link, Tooltip } from '@mimir-wallet/ui';

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
      <div className='flex items-center justify-between sm:flex-row flex-col p-5 gap-3 rounded-large shadow-medium bg-background'>
        <div className='flex-1 flex items-center gap-2.5'>
          <Avatar src='/images/wallet-connect.webp' style={{ width: 40, height: 40 }} className='flex-shrink-0' />
          <div>
            <div className='flex items-center gap-1.5'>
              <b className='text-medium mr-1'>Login as Multisig</b>
              {apps.map((app) => (
                <Tooltip color='foreground' content={app.name} key={app.name}>
                  <Link href={app.url} isExternal>
                    <img alt={app.name} src={app.icon} className='w-4 h-4 rounded-full' />
                  </Link>
                </Tooltip>
              ))}
            </div>
            <p className='mt-1 text-tiny text-divider-300'>
              Connect to any other Dapp supports wallet connect. And also you can connect to Mimir.
            </p>
          </div>
        </div>
        <Button
          color='primary'
          endContent={
            <div className='w-4 h-4 rounded-full bg-primary-foreground p-0.5 text-primary'>
              <IconWalletConnect style={{ width: 12, height: 12 }} />
            </div>
          }
          radius='full'
          onClick={toggleOpen}
          className='sm:w-auto w-full'
        >
          Connect to Dapp
        </Button>
      </div>

      {isReady && <WalletConnectModal isOpen={isOpen} onClose={toggleOpen} />}
    </>
  );
}

export default WalletConnectExample;
