// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import IconClose from '@/assets/svg/icon-close.svg?react';
import { useBalanceTotalUsd } from '@/hooks/useBalances';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useQueryParam } from '@/hooks/useQueryParams';
import { useMultiChainStats } from '@/hooks/useQueryStats';
import { useRef, useState } from 'react';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { Button, Link, Tab, Tabs } from '@mimir-wallet/ui';

import Assets from './Assets';
import Hero from './Hero';
import Structure from './Structure';
import TransactionStats from './TransactionStats';

function Dashboard({ address }: { address: string }) {
  const { genesisHash } = useApi();
  const [tab, setTab] = useQueryParam('tab', 'asset', { replace: true });
  const [showBanner, setShowBanner] = useState(true);
  const tabsRef = useRef([
    { tab: 'asset', label: 'Asset' },
    { tab: 'structure', label: 'Structure' },
    { tab: 'transaction', label: 'Transaction' }
  ]);
  const [totalUsd, changes] = useBalanceTotalUsd(address);
  const [network, setNetwork] = useInputNetwork(undefined);
  const [stats] = useMultiChainStats(address);

  return (
    <div className='w-full space-y-5'>
      {[
        '0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b',
        '0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed'
      ].includes(genesisHash) &&
        showBanner && (
          <div className='relative w-full'>
            <Link href='https://wave.bifrost.io' target='_blank' rel='noreferrer' className='w-full block'>
              <img className='w-full rounded-medium' src='/images/bifrost.webp' alt='Bifrost banner' />
            </Link>
            <Button
              isIconOnly
              className='absolute top-2 right-2 text-white'
              onPress={() => setShowBanner(false)}
              aria-label='Close banner'
              color='primary'
              variant='light'
            >
              <IconClose />
            </Button>
          </div>
        )}

      <Hero address={address} totalUsd={totalUsd} changes={changes} />

      <Tabs
        color='primary'
        selectedKey={tab}
        onSelectionChange={(key) => setTab(key.toString())}
        classNames={{
          base: 'w-full'
        }}
      >
        {tabsRef.current.map((item) => (
          <Tab key={item.tab} title={item.label}>
            {tab === 'asset' && <Assets address={address} />}
            {tab === 'structure' && (
              <SubApiRoot network={network}>
                <Structure address={address} setNetwork={setNetwork} />
              </SubApiRoot>
            )}
            {tab === 'transaction' && <TransactionStats chains={Object.keys(stats)} address={address} />}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default Dashboard;
