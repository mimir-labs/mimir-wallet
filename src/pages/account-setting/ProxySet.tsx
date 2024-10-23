// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Vec } from '@polkadot/types';
import type { PalletProxyProxyDefinition } from '@polkadot/types/lookup';

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography
} from '@mui/material';
import { BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import IconClock from '@mimir-wallet/assets/svg/icon-clock.svg?react';
import IconDelete from '@mimir-wallet/assets/svg/icon-delete.svg?react';
import IconInfo from '@mimir-wallet/assets/svg/icon-info-fill.svg?react';
import { AddressRow } from '@mimir-wallet/components';
import { useAccount, useApi, useTxQueue } from '@mimir-wallet/hooks';

import DeleteAllProxy from './DeleteAllProxy';

function ProxySet({ address, proxies }: { address: string; proxies: Vec<PalletProxyProxyDefinition> }) {
  const { api } = useApi();
  const { isLocalAccount } = useAccount();
  const { addQueue } = useTxQueue();

  const isReadOnly = useMemo(() => !isLocalAccount(address), [address, isLocalAccount]);

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
                  <AddressRow withAddress withName shorten value={proxy.delegate.toString()} />
                </Box>
                {proxy.delay.gt(BN_ZERO) ? (
                  <Tooltip title={`Delay Blocks: ${[proxy.delay]}`}>
                    <SvgIcon
                      component={IconClock}
                      inheritViewBox
                      sx={{ fontSize: '0.875rem', color: 'primary.main', opacity: 0.7 }}
                    />
                  </Tooltip>
                ) : null}
                <Chip color='secondary' label={proxy.proxyType.toString()} />
                {!isReadOnly && (
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

        <Alert
          icon={<SvgIcon inheritViewBox component={IconInfo} sx={{ fontSize: '0.875rem' }} />}
          severity='warning'
          sx={{ '.MuiAlert-message': { overflow: 'visible' } }}
        >
          <AlertTitle>Notice</AlertTitle>
          <ul>
            <li>Only All authority can delete proxy.</li>
            <li>Deleting a Proxy will refund the fees, while adding a Proxy requires an additional deposit fee.</li>
          </ul>
        </Alert>

        <Button component={Link} variant='contained' fullWidth to='/add-proxy'>
          Add New Proxy
        </Button>

        <DeleteAllProxy address={address} />
      </Stack>
    </>
  );
}

export default ProxySet;
