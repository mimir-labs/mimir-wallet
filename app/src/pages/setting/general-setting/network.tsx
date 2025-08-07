// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { InputNetwork } from '@/components';
import { isValidWsUrl } from '@/utils';
import { WsProvider } from '@polkadot/api';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

import { type Endpoint, NETWORK_RPC_PREFIX, useNetworks } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';
import {
  Alert,
  AlertTitle,
  Autocomplete,
  type AutocompleteOption,
  Button,
  buttonSpinner,
  Divider
} from '@mimir-wallet/ui';

function Content({ chain }: { chain: Endpoint }) {
  const { networks } = useNetworks();
  const [url, setUrl] = useState(
    (store.get(`${NETWORK_RPC_PREFIX}${chain.key}`) as string) || Object.values(networks[0].wsUrl)[0] || ''
  );
  const [error, setError] = useState<Error | undefined>(undefined);

  const [state, handleSave] = useAsyncFn(async () => {
    if (!isValidWsUrl(url)) {
      setError(new Error('Invalid URL, expect ws:// or wss://'));

      return;
    }

    const provider = new WsProvider(url);

    const rpcGenesisHash = await provider.isReady.then(() => {
      return provider.send('chain_getBlockHash', [0]);
    });

    if (rpcGenesisHash !== chain.genesisHash) {
      setError(new Error('Genesis hash mismatch'));

      return;
    }

    provider.disconnect();

    store.set(`${NETWORK_RPC_PREFIX}${chain.key}`, url);
  }, [url, chain.genesisHash, chain.key]);

  // Convert wsUrl entries to autocomplete options
  const rpcOptions: AutocompleteOption[] = Object.entries(chain.wsUrl).map(([name, wsUrl]) => ({
    value: wsUrl,
    label: name,
    url: wsUrl,
    name
  }));

  return (
    <>
      <div className='flex flex-col gap-2'>
        <label className='text-sm font-medium'>Network RPC</label>
        <Autocomplete
          options={rpcOptions}
          value={url}
          onValueChange={(value) => {
            setUrl(value);
            setError(undefined);
          }}
          inputValue={url}
          onInputChange={(value) => {
            setUrl(value);
            setError(undefined);
          }}
          placeholder='Please select or input rpc url ws:// or wss://'
          allowCustomValue
          onCustomValue={(value) => {
            if (isValidWsUrl(value)) {
              setUrl(value);
            } else {
              setError(new Error('Invalid URL, expect ws:// or wss://'));
            }
          }}
          renderOption={(option) => (
            <div className='flex w-full items-center justify-between'>
              <span className='text-sm'>{option.url}</span>
              <span className='text-muted-foreground text-right text-xs'>{option.name}</span>
            </div>
          )}
        />
      </div>
      {error && (
        <Alert variant='destructive'>
          <AlertTitle>{error.message}</AlertTitle>
        </Alert>
      )}

      <Divider />

      <Button disabled={!url || state.loading} fullWidth onClick={handleSave}>
        {state.loading ? buttonSpinner : undefined}
        Save
      </Button>
    </>
  );
}

function NetworkSetting() {
  const { networks } = useNetworks();
  const [network, setNetwork] = useState(networks[0].key);

  const chain = networks.find((item) => item.key === network);

  return (
    <div className='bg-content1 shadow-medium flex flex-col gap-5 rounded-[20px] p-5'>
      <InputNetwork showAllNetworks label='Select Network' network={network} setNetwork={setNetwork} />

      {chain && <Content key={chain.key} chain={chain} />}
    </div>
  );
}

export default NetworkSetting;
