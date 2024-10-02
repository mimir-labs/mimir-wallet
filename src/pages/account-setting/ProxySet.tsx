// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Vec } from '@polkadot/types';
import type { PalletProxyProxyDefinition } from '@polkadot/types/lookup';

import { Alert, AlertTitle, Box, Button, Chip, Divider, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import { AddressRow } from '@mimir-wallet/components';
import { useApi, useTxQueue, useWallet } from '@mimir-wallet/hooks';

function ProxySet({ address, proxies }: { address: string; proxies: Vec<PalletProxyProxyDefinition> }) {
  const { api } = useApi();
  const { accountSource } = useWallet();
  const { addQueue } = useTxQueue();

  const isInjected = useMemo(() => !!accountSource(address), [address, accountSource]);

  return (
    <>
      <Stack spacing={2}>
        <Box sx={{ borderRadius: 1, padding: 1, bgcolor: 'secondary.main' }}>
          <Typography fontWeight={700}>Proxy Account</Typography>
          <Stack spacing={1} sx={{ marginTop: 0.5, borderRadius: 1, padding: 1, bgcolor: 'white' }}>
            {proxies.map((proxy, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: 'white',
                  borderRadius: 0.5,
                  gap: 0.5
                }}
              >
                <Box sx={{ flex: '1' }}>
                  <AddressRow size='small' withAddress withName shorten value={proxy.delegate.toString()} />
                </Box>
                <Chip color='secondary' label={proxy.proxyType.toString()} />
                {isInjected && (
                  <IconButton
                    color='error'
                    size='small'
                    sx={{ fontSize: 'inherit' }}
                    onClick={() => {
                      addQueue({
                        accountId: address,
                        call: api.tx.proxy.removeProxy(proxy.delegate, proxy.proxyType, proxy.delay),
                        website: 'mimir://internal/setup'
                      });
                    }}
                  >
                    <SvgIcon component={IconDelete} inheritViewBox />
                  </IconButton>
                )}
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        <Alert severity='warning'>
          <AlertTitle>Notice</AlertTitle>
          <ul>
            <li>Only All authority can delete proxy.</li>
            <li>Deleting a Proxy will refund the fees, while adding a Proxy requires an additional deposit fee.</li>
          </ul>
        </Alert>

        <Button component={Link} variant='contained' fullWidth to={`/add-proxy/${address}`}>
          Add New Proxy
        </Button>
      </Stack>
    </>
  );
}

export default ProxySet;
