// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Input, InputNetwork } from '@/components';
import { isValidWsUrl } from '@/utils';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';

import { NETWORK_RPC_PREFIX, SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';
import { Alert, Button, Divider } from '@mimir-wallet/ui';

function Content() {
  const { network, allApis } = useApi();
  const [url, setUrl] = useState((store.get(`${NETWORK_RPC_PREFIX}${network}`) as string) || '');
  const [error, setError] = useState<Error | undefined>(undefined);

  const chain = useMemo(() => {
    return Object.values(allApis).find((item) => item.chain.key === network)?.chain;
  }, [network, allApis]);

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
    <div className='flex flex-col gap-5 p-5 bg-content1 shadow-medium rounded-large'>
      <InputNetwork label='Select Network' />

      <Input
        label='Network RPC'
        onChange={setUrl}
        placeholder='Please input rpc url ws:// or wss://'
        value={url}
        color={error ? 'error' : undefined}
      />
      {error && <Alert color='danger'>{error.message}</Alert>}

      <Divider />

      <Button isDisabled={!url} fullWidth isLoading={state.loading} onPress={handleSave}>
        Save
      </Button>
    </div>
  );
}

function NetworkSetting() {
  return (
    <SubApiRoot>
      <Content />
    </SubApiRoot>
  );
}

export default NetworkSetting;
