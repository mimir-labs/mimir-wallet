// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Endpoint } from './types.js';

import { isHex } from '@polkadot/util';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocalStore } from '@mimir-wallet/service';

import { allEndpoints } from './config.js';
import { ApiContext } from './context.js';
import { DEFAULE_SS58_CHAIN_KEY } from './defaults.js';
import { destroyApi, initializeApi } from './initialize.js';
import { useAllApis } from './useApiStore.js';
import { useNetworks } from './useNetworks.js';

function ApiRoot({ chain, children }: { chain: Endpoint; children: React.ReactNode }): JSX.Element | null {
  const { networks } = useNetworks();
  const { chains } = useAllApis();
  const [storeSs58Chain, setStoreSs58Chain] = useLocalStore<string>(DEFAULE_SS58_CHAIN_KEY);
  const [network, setNetwork] = useState(chain.key);
  const networkValues = useMemo(() => {
    const networkValues = chains[network];

    if (!networkValues) {
      return Object.values(chains)[0];
    }

    return networkValues;
  }, [network, chains]);

  useEffect(() => {
    setNetwork(networkValues.network);
  }, [networkValues.network]);

  const allApis = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(chains)
          .filter(([, { api }]) => !!api)
          .map(([network, { api, ...rest }]) => [network, { ...rest, api: api as ApiPromise }])
          .sort(([a], [b]) => {
            const aIndex = networks.findIndex((n) => n.key === a);
            const bIndex = networks.findIndex((n) => n.key === b);

            return aIndex - bIndex;
          })
      ),
    [chains, networks]
  );

  useEffect(() => {
    for (const network of networks) {
      if (network.enabled) {
        initializeApi(network);
      } else {
        destroyApi(network.key);
      }
    }
  }, [networks]);

  const [chainSS58, ss58Chain] = useMemo(() => {
    let ss58Format: number;
    let ss58Chain: string;

    if (!storeSs58Chain) {
      ss58Format = 0;
      ss58Chain = networks[0].key;
    } else {
      const network = networks.find((item) => item.key === storeSs58Chain) ?? networkValues.chain;

      ss58Format = network.ss58Format;
      ss58Chain = network.key;
    }

    return [ss58Format, ss58Chain];
  }, [storeSs58Chain, networkValues.chain, networks]);

  const setSs58Chain = useCallback(
    (chain: string) => {
      setStoreSs58Chain(chain);
    },
    [setStoreSs58Chain]
  );

  const _setNetwork = useCallback((network: string) => {
    if (isHex(network)) {
      const key = allEndpoints.find((item) => item.genesisHash === network)?.key;

      key && setNetwork(key);
    } else {
      setNetwork(network);
    }
  }, []);

  if (!networkValues || !networkValues.api) {
    return null;
  }

  return (
    <ApiContext.Provider
      value={{
        ...networkValues,
        allApis: allApis,
        network: networkValues.network,
        api: networkValues.api,
        chainSS58,
        ss58Chain,
        setSs58Chain,
        setNetwork: _setNetwork
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export default ApiRoot;
