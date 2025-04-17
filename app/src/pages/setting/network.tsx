// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { InputNetwork } from '@/components';
import { useInputNetwork } from '@/hooks/useInputNetwork';
import { isValidWsUrl } from '@/utils';
import { WsProvider } from '@polkadot/api';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

import { NETWORK_RPC_PREFIX, SubApiRoot, useApi } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';
import { Alert, Autocomplete, AutocompleteItem, Button, Divider } from '@mimir-wallet/ui';

function Content({ network, setNetwork }: { network: string; setNetwork: (network: string) => void }) {
  const { chain, genesisHash } = useApi();
  const [url, setUrl] = useState((store.get(`${NETWORK_RPC_PREFIX}${network}`) as string) || '');
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

    if (rpcGenesisHash !== genesisHash) {
      setError(new Error('Genesis hash mismatch'));

      return;
    }

    store.set(`${NETWORK_RPC_PREFIX}${network}`, url);
  }, [url, genesisHash, network]);

  return (
    <div className='flex flex-col gap-5 p-5 bg-content1 shadow-medium rounded-large'>
      <InputNetwork label='Select Network' network={network} setNetwork={setNetwork} />

      <Autocomplete
        allowsCustomValue
        labelPlacement='outside'
        defaultInputValue={url}
        defaultItems={Object.entries(chain.wsUrl)}
        label='Network RPC'
        placeholder='Please select or input rpc url ws:// or wss://'
        variant='bordered'
        onInputChange={(value) => {
          setUrl(value);
        }}
      >
        {(item) => (
          <AutocompleteItem startContent={<b>{item[0]}</b>} key={item[0]} classNames={{ title: 'text-right' }}>
            {item[1]}
          </AutocompleteItem>
        )}
      </Autocomplete>
      {error && <Alert color='danger'>{error.message}</Alert>}

      <Divider />

      <Button isDisabled={!url} fullWidth isLoading={state.loading} onPress={handleSave}>
        Save
      </Button>
    </div>
  );
}

function NetworkSetting() {
  const [network, setNetwork] = useInputNetwork();

  return (
    <SubApiRoot network={network}>
      <Content key={network} network={network} setNetwork={setNetwork} />
    </SubApiRoot>
  );
}

export default NetworkSetting;
