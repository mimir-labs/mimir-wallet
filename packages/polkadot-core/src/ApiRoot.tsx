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
  const { networks, mode } = useNetworks();
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
    if (mode === 'solo' && chain.identityNetwork) {
      const identity = networks.find((network) => network.key === chain.identityNetwork);

      identity && initializeApi(identity);
    }
  }, [mode, chain, networks]);

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
    if (mode === 'omni') {
      for (const network of networks) {
        if (network.enabled) {
          initializeApi(network);
        } else {
          destroyApi(network.key);
        }
      }
    }
  }, [mode, networks]);

  const [chainSS58, ss58Chain] = useMemo(() => {
    let ss58Format: number;
    let ss58Chain: string;

    if (!storeSs58Chain) {
      ss58Format = mode === 'omni' ? 0 : networkValues.chain.ss58Format;
      ss58Chain = mode === 'omni' ? networks[0].key : networkValues.chain.key;
    } else {
      const network =
        mode === 'omni'
          ? (networks.find((item) => item.key === storeSs58Chain) ?? networkValues.chain)
          : networkValues.chain;

      ss58Format = network.ss58Format;
      ss58Chain = network.key;
    }

    return [ss58Format, ss58Chain];
  }, [storeSs58Chain, mode, networkValues.chain, networks]);

  const setSs58Chain = useCallback(
    (chain: string) => {
      setStoreSs58Chain(chain);
    },
    [setStoreSs58Chain]
  );

  const _setNetwork = useCallback(
    (network: string) => {
      if (mode === 'omni') {
        if (isHex(network)) {
          const key = allEndpoints.find((item) => item.genesisHash === network)?.key;

          key && setNetwork(key);
        } else {
          setNetwork(network);
        }
      }
    },
    [mode]
  );

  if (!networkValues || !networkValues.api) {
    return null;
  }

  return (
    <ApiContext.Provider
      value={{
        ...networkValues,
        allApis: mode === 'omni' ? allApis : { [networkValues.network]: networkValues },
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
