// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, Paper, Stack } from '@mui/material';
import { BN, BN_ZERO } from '@polkadot/util';
import { useMemo, useRef } from 'react';

import { useApi, useNativeBalances, useQueryAccount, useQueryParam, useTokenInfo } from '@mimir-wallet/hooks';
import { formatUnits } from '@mimir-wallet/utils';

import Assets from './Assets';
import Hero from './Hero';
import MultiChain from './MultiChain';
import PendingTx from './PendingTx';
import Structure from './Structure';

function Dashboard({ address }: { address: string }) {
  const { genesisHash } = useApi();
  const [tokenInfo] = useTokenInfo();
  const balances = useNativeBalances(address);
  const { tokenSymbol, api } = useApi();
  const [tab, setTab] = useQueryParam('tab', 'asset', { replace: true });
  const tabsRef = useRef([
    { tab: 'asset', label: 'Asset' },
    { tab: 'structure', label: 'Structure' },
    { tab: 'transaction', label: 'Transaction' },
    { tab: 'multichain', label: 'Multi-Chain' }
  ]);
  const [account] = useQueryAccount(address);

  const [total] = useMemo(() => {
    const price = tokenInfo?.[tokenSymbol]?.price || '0';

    const priceBN = new BN(Math.ceil(Number(price) * 1e6));

    return [
      balances?.total.mul(priceBN).divn(1e6),
      balances?.transferrable.mul(priceBN).divn(1e6),
      balances?.locked.mul(priceBN).divn(1e6),
      balances?.reserved.mul(priceBN).divn(1e6)
    ];
  }, [balances, tokenInfo, tokenSymbol]);

  const changes = Number(tokenInfo?.[tokenSymbol]?.price_change || '0');

  const totalUsd = useMemo(
    () => formatUnits(total || BN_ZERO, api.registry.chainDecimals[0]),
    [api.registry.chainDecimals, total]
  );

  return (
    <Stack spacing={2} width='100%'>
      {[
        '0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b',
        '0x9f28c6a68e0fc9646eff64935684f6eeeece527e37bbe1f213d22caa1d9d6bed'
      ].includes(genesisHash) && (
        <Box component='a' href='https://wave.bifrost.io' target='_blank' rel='noreferrer'>
          <Box component='img' src='/images/bifrost.webp' sx={{ width: '100%', borderRadius: 2 }} />
        </Box>
      )}

      <Hero address={address} totalUsd={totalUsd} changes={changes} />

      <Paper sx={{ borderRadius: '20px', padding: 1, display: 'inline-flex', gap: { sm: 1, xs: 0.5 } }}>
        {tabsRef.current
          .filter((item) => (item.tab === 'multichain' ? account?.type !== 'pure' : true))
          .map((item) => (
            <Button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              sx={{ borderRadius: 1, paddingX: { sm: 3, xs: 0.5 }, opacity: tab === item.tab ? 1 : 0.5 }}
              variant={tab === item.tab ? 'contained' : 'text'}
            >
              {item.label}
            </Button>
          ))}
      </Paper>

      {tab === 'asset' && <Assets address={address} nativeBalance={balances} />}
      {tab === 'structure' && <Structure address={address} />}
      {tab === 'transaction' && <PendingTx address={address} />}
      {account?.type !== 'pure' && tab === 'multichain' && <MultiChain address={address} />}
    </Stack>
  );
}

export default Dashboard;
