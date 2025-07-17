// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { InputNetwork } from '@/components';
import { isValidWsUrl } from '@/utils';
import { WsProvider } from '@polkadot/api';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

import { type Endpoint, NETWORK_RPC_PREFIX, useNetworks } from '@mimir-wallet/polkadot-core';
import { store } from '@mimir-wallet/service';
import { Alert, Autocomplete, AutocompleteItem, Button, Divider } from '@mimir-wallet/ui';

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

  return (
    <>
      <Autocomplete
        allowsCustomValue
        labelPlacement='outside'
        defaultInputValue={url}
        defaultItems={Object.entries(chain.wsUrl)}
        label='Network RPC'
        placeholder='Please select or input rpc url ws:// or wss://'
        variant='bordered'
        inputValue={url}
        onInputChange={(value) => {
          if (isValidWsUrl(value)) {
            setUrl(value);
          } else if (chain.wsUrl?.[value]) {
            setUrl(chain.wsUrl[value]);
          }
        }}
      >
        {(item) => (
          <AutocompleteItem startContent={item[1]} key={item[1]} classNames={{ title: 'text-right' }}>
            {item[0]}
          </AutocompleteItem>
        )}
      </Autocomplete>
      {error && <Alert color='danger'>{error.message}</Alert>}

      <Divider />

      <Button isDisabled={!url} fullWidth isLoading={state.loading} onPress={handleSave}>
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
    <div className='bg-content1 shadow-medium rounded-large flex flex-col gap-5 p-5'>
      <InputNetwork showAllNetworks label='Select Network' network={network} setNetwork={setNetwork} />

      {chain && <Content key={chain.key} chain={chain} />}
    </div>
  );
}

export default NetworkSetting;
