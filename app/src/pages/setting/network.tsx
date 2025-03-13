// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Input } from '@/components';
import { allEndpoints } from '@/config';
import { NETWORK_RPC_PREFIX } from '@/constants';
import { useApi } from '@/hooks/useApi';
import { isValidWsUrl } from '@/utils';
import { LoadingButton } from '@mui/lab';
import { Alert, Avatar, Box, Divider, Paper, Stack } from '@mui/material';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import { store } from '@mimir-wallet/service';

function NetworkSetting() {
  const { network } = useApi();
  const [url, setUrl] = useState((store.get(`${NETWORK_RPC_PREFIX}${network}`) as string) || '');
  const [error, setError] = useState<Error | undefined>(undefined);

  const chain = useMemo(() => {
    return allEndpoints.find((item) => item.key === network);
  }, [network]);

  const [state, handleSave] = useAsyncFn(async () => {
    if (!isValidWsUrl(url)) {
      setError(new Error('Invalid URL, expect ws:// or wss://'));

      return;
    }

    const api = await ApiPromise.create({
      provider: new WsProvider(url)
    });

    if (api.genesisHash.toString() !== chain?.genesisHash) {
      setError(new Error('Genesis hash mismatch'));

      return;
    }

    store.set(`${NETWORK_RPC_PREFIX}${network}`, url);

    window.location.reload();
  }, [url, chain, network]);

  return (
    <Paper component={Stack} sx={{ padding: 2, borderRadius: 2 }} spacing={2}>
      <Input
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {chain && <Avatar src={chain.icon} sx={{ width: 20, height: 20 }} />}
            Network RPC
          </Box>
        }
        onChange={setUrl}
        placeholder='Please input rpc url ws:// or wss://'
        value={url}
        color={error ? 'error' : undefined}
      />
      {error && (
        <Alert sx={{ alignItems: 'center' }} severity='error'>
          {error.message}
        </Alert>
      )}

      <Divider />

      <LoadingButton disabled={!url} fullWidth loading={state.loading} onClick={handleSave}>
        Save
      </LoadingButton>
    </Paper>
  );
}

export default NetworkSetting;
