// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { u128, Vec } from '@polkadot/types';
import type { PalletProxyProxyDefinition } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Paper, Stack, Tab, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAccount } from '@mimir-wallet/accounts/useAccount';
import { useAddressMeta } from '@mimir-wallet/accounts/useAddressMeta';
import { useQueryAccount } from '@mimir-wallet/accounts/useQueryAccount';
import { Input } from '@mimir-wallet/components';
import { toastSuccess } from '@mimir-wallet/components/utils';
import { useApi } from '@mimir-wallet/hooks/useApi';
import { useCall } from '@mimir-wallet/hooks/useCall';
import { usePendingTransactions } from '@mimir-wallet/hooks/useTransactions';

import MemberSet from './MemberSet';
import ProxySet from './ProxySet';

function AccountSetting() {
  const { api } = useApi();
  const navigate = useNavigate();
  const { isLocalAccount, current: address } = useAccount();
  const { setName, name, saveName } = useAddressMeta(address);
  const [account] = useQueryAccount(address);
  const [error, setError] = useState<Error>();
  const [txs] = usePendingTransactions(address);
  const [tab, setTab] = useState('0');
  const proxies = useCall<ITuple<[Vec<PalletProxyProxyDefinition>, u128]>>(api.query.proxy?.proxies, [address]);

  const multisigDelegates = useMemo(
    () => (account?.type === 'pure' ? account.delegatees.filter((item) => item.type === 'multisig') : []),
    [account]
  );

  return (
    <>
      <Stack spacing={2} sx={{ width: 500, maxWidth: '100%', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate(-1)} size='small' variant='outlined'>
            {'<'} Back
          </Button>
        </Box>
        <Typography variant='h3'>Setting</Typography>

        <Box>
          <Typography fontWeight={700} color='textSecondary' marginBottom={0.5}>
            Name
          </Typography>
          <Paper component={Stack} sx={{ padding: 2, borderRadius: 2 }} spacing={1}>
            <Input
              label='Name'
              onChange={(value) => {
                if (value) {
                  setError(undefined);
                }

                setName(value);
              }}
              placeholder='Please input account name'
              value={name}
              error={error}
            />
            <Typography fontSize='0.75rem' color='textSecondary' marginTop={1}>
              All members will see this name
            </Typography>
            <Button
              disabled={!address || !isLocalAccount(address)}
              fullWidth
              onClick={() => {
                if (!name) {
                  setError(new Error('Please input wallet name'));
                } else {
                  saveName((name) => toastSuccess(`Save name to ${name} success`));
                }
              }}
            >
              Save
            </Button>
          </Paper>
        </Box>

        {(account?.type === 'multisig' || (account?.type === 'pure' && multisigDelegates.length > 0)) && (
          <Box>
            <Typography fontWeight={700} color='textSecondary' marginBottom={0.5}>
              Multisig Information
            </Typography>
            <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
              {account?.type === 'pure' && txs.length > 0 && (
                <Box
                  color='primary.main'
                  onClick={() => {
                    navigate('/transactions');
                  }}
                  sx={{ cursor: 'pointer', marginBottom: 2, fontWeight: 700 }}
                >
                  Please process {txs.length} Pending Transaction first
                </Box>
              )}

              {account && account.type === 'multisig' && <MemberSet account={account} disabled />}

              {account &&
                account.type === 'pure' &&
                (multisigDelegates.length > 1 ? (
                  <>
                    <TabContext value={tab}>
                      <Box>
                        <TabList onChange={(_, value) => setTab(value)} variant='scrollable' scrollButtons='auto'>
                          {multisigDelegates.map((_, index) => (
                            <Tab
                              sx={{ padding: 1 }}
                              label={`Members Set${index + 1}`}
                              value={String(index)}
                              key={index}
                            />
                          ))}
                        </TabList>
                      </Box>
                      {multisigDelegates.map((item, index) => (
                        <TabPanel key={index} value={String(index)} sx={{ padding: 0, marginTop: 2 }}>
                          <MemberSet account={item} pureAccount={account} disabled={!!txs.length} />
                        </TabPanel>
                      ))}
                    </TabContext>
                  </>
                ) : (
                  <MemberSet account={multisigDelegates[0]} pureAccount={account} disabled={!!txs.length} />
                ))}
            </Paper>
          </Box>
        )}

        {api.tx.proxy && address && proxies && account && proxies[0].length > 0 && (
          <Box>
            <Typography fontWeight={700} color='textSecondary' marginBottom={0.5}>
              Proxy Information
            </Typography>
            <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
              <ProxySet account={account} address={address} proxies={proxies[0]} />
            </Paper>
          </Box>
        )}
      </Stack>
    </>
  );
}

export default AccountSetting;
