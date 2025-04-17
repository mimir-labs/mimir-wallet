// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PureAccountData } from '@/hooks/types';

import { usePendingTransactions } from '@/hooks/useTransactions';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Paper, Tab, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useApi } from '@mimir-wallet/polkadot-core';

import MemberSet from './MemberSet';

function PureMemberSet({ account }: { account: PureAccountData }) {
  const { network } = useApi();
  const multisigDelegatees = account.delegatees.filter((item) => item.type === 'multisig');
  const [txs] = usePendingTransactions(network, account.address);
  const [tab, setTab] = useState('0');
  const navigate = useNavigate();

  if (multisigDelegatees.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography fontWeight={700} color='textSecondary' marginBottom={0.5}>
        Multisig Information
      </Typography>
      <Paper sx={{ padding: 2, borderRadius: 2, marginTop: 1 }}>
        {txs.length > 0 && (
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

        {multisigDelegatees.length > 1 ? (
          <>
            <TabContext value={tab}>
              <Box>
                <TabList onChange={(_, value) => setTab(value)} variant='scrollable' scrollButtons='auto'>
                  {multisigDelegatees.map((_, index) => (
                    <Tab sx={{ padding: 1 }} label={`Members Set${index + 1}`} value={String(index)} key={index} />
                  ))}
                </TabList>
              </Box>
              {multisigDelegatees.map((item, index) => (
                <TabPanel key={index} value={String(index)} sx={{ padding: 0, marginTop: 2 }}>
                  <MemberSet account={item} pureAccount={account} disabled={!!txs.length} />
                </TabPanel>
              ))}
            </TabContext>
          </>
        ) : (
          <MemberSet account={multisigDelegatees[0]} pureAccount={account} disabled={!!txs.length} />
        )}
      </Paper>
    </Box>
  );
}

export default PureMemberSet;
