// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAddressSupportedNetworks } from '@/hooks/useAddressSupportedNetwork';
import { useBalanceTotalUsd } from '@/hooks/useBalances';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { useQueryParam } from '@/hooks/useQueryParams';
import { useRef } from 'react';

import { SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { Link, Tab, Tabs } from '@mimir-wallet/ui';

import Assets from './Assets';
import Hero from './Hero';
// import PendingTx from './PendingTx';
import Structure from './Structure';

function Dashboard({ address }: { address: string }) {
  const { genesisHash } = useApi();
  const [tab, setTab] = useQueryParam('tab', 'asset', { replace: true });
  const tabsRef = useRef([
    { tab: 'asset', label: 'Asset' },
    { tab: 'structure', label: 'Structure' }
    // { tab: 'transaction', label: 'Transaction' }
  ]);
  const [totalUsd, changes] = useBalanceTotalUsd(address);
  const supportedNetworks = useAddressSupportedNetworks(address);
  const [network, setNetwork] = useInputNetwork(
    undefined,
    supportedNetworks?.map((item) => item.key)
  );

  return (
    <div className='w-full space-y-5'>
      {[
        '0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b',
        '0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed'
      ].includes(genesisHash) && (
        <Link href='https://wave.bifrost.io' target='_blank' rel='noreferrer' className='w-full'>
          <img className='w-full rounded-medium' src='/images/bifrost.webp' />
        </Link>
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
              <SubApiRoot network={network} supportedNetworks={supportedNetworks?.map((item) => item.key)}>
                <Structure address={address} setNetwork={setNetwork} />
              </SubApiRoot>
            )}
            {/* {tab === 'transaction' && <PendingTx address={address} />} */}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}

export default Dashboard;
