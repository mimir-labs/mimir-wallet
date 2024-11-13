// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainProperties, ChainType } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';
import type { ApiProps, ApiState } from './types';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { deriveMapCache, setDeriveCache } from '@polkadot/api-derive/util';
import { formatBalance, isTestChain, objectSpread, stringify } from '@polkadot/util';
import { decodeAddress as decodeAddressBase, encodeAddress as encodeAddressBase } from '@polkadot/util-crypto';
import React, { useEffect, useMemo, useState } from 'react';

import { allEndpoints, Endpoint, typesBundle } from '@mimir-wallet/config';
import { useApiUrl } from '@mimir-wallet/hooks';
import { service } from '@mimir-wallet/utils';

interface Props {
  children: React.ReactNode;
  chain: Endpoint;
}

interface ChainData {
  properties: ChainProperties;
  systemChain: string;
  systemChainType: ChainType;
  systemName: string;
  systemVersion: string;
}

export const DEFAULT_AUX = ['Aux1', 'Aux2', 'Aux3', 'Aux4', 'Aux5', 'Aux6', 'Aux7', 'Aux8', 'Aux9'];

export function encodeAddress(key: string | Uint8Array, ss58Format = window?.currentChain?.ss58Format) {
  return encodeAddressBase(key, ss58Format);
}

export function decodeAddress(address: string) {
  return decodeAddressBase(address);
}

export const ApiCtx = React.createContext<ApiProps>({} as unknown as ApiProps);

const EMPTY_STATE = { hasInjectedAccounts: false, isApiReady: false } as unknown as ApiState;

let api: ApiPromise;

export { api };

async function retrieve(api: ApiPromise): Promise<ChainData> {
  const [systemChain, systemChainType, systemName, systemVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.chainType
      ? api.rpc.system.chainType()
      : Promise.resolve(api.registry.createType('ChainType', 'Live')),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  return {
    properties: api.registry.createType('ChainProperties', {
      ss58Format: api.registry.chainSS58,
      tokenDecimals: api.registry.chainDecimals,
      tokenSymbol: api.registry.chainTokens
    }),
    systemChain: (systemChain || '<unknown>').toString(),
    systemChainType,
    systemName: systemName.toString(),
    systemVersion: systemVersion.toString()
  };
}

async function loadOnReady(api: ApiPromise, chain: Endpoint): Promise<ApiState> {
  const { properties, systemChain, systemChainType, systemName, systemVersion } = await retrieve(api);
  const ss58Format = chain.ss58Format;
  const tokenSymbol = properties.tokenSymbol.unwrapOr([formatBalance.getDefaults().unit, ...DEFAULT_AUX]);
  const tokenDecimals = properties.tokenDecimals.unwrapOr([api.registry.createType('u32', 12)]);
  const isDevelopment = systemChainType.isDevelopment || systemChainType.isLocal || isTestChain(systemChain);

  console.log(`chain: ${systemChain} (${systemChainType.toString()}), ${stringify(properties)}`);

  // explicitly override the ss58Format as specified
  api.registry.setChainProperties(
    api.registry.createType('ChainProperties', { ss58Format: chain.ss58Format, tokenDecimals, tokenSymbol })
  );

  // first setup the UI helpers
  formatBalance.setDefaults({
    decimals: tokenDecimals.map((b) => b.toNumber()),
    unit: tokenSymbol[0].toString()
  });

  const defaultSection = Object.keys(api.tx)[0];
  const defaultMethod = Object.keys(api.tx[defaultSection])[0];
  const apiDefaultTx = api.tx[defaultSection][defaultMethod];
  const apiDefaultTxSudo = (api.tx.system && api.tx.system.setCode) || apiDefaultTx;

  setDeriveCache(api.genesisHash.toHex(), deriveMapCache);

  console.log(api.genesisHash.toHex());

  return {
    apiDefaultTx,
    apiDefaultTxSudo,
    chainSS58: ss58Format,
    isApiReady: true,
    isDevelopment,
    specName: api.runtimeVersion.specName.toString(),
    specVersion: api.runtimeVersion.specVersion.toString(),
    systemChain,
    systemName,
    systemVersion,
    tokenSymbol: tokenSymbol[0].toString(),
    genesisHash: api.genesisHash.toHex()
  };
}

/**
 * @internal
 */
async function createApi(apiUrl: string, onError: (error: unknown) => void): Promise<void> {
  let metadata: Record<string, HexString> = {};

  try {
    metadata = await service.getMetadata();
  } catch {
    /* empty */
  }

  try {
    const provider = new WsProvider(apiUrl);

    api = new ApiPromise({
      provider,
      typesBundle,
      typesChain: {
        Crust: {
          DispatchErrorModule: 'DispatchErrorModuleU8'
        }
      },
      metadata
    });
  } catch (error) {
    onError(error);
  }
}

export function ApiCtxRoot({ chain, children }: Props): React.ReactElement<Props> | null {
  const [state, setState] = useState<ApiState>(EMPTY_STATE);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isApiInitialized, setIsApiInitialized] = useState<boolean>();
  const [apiError, setApiError] = useState<null | string>(null);
  const peopleEndpoint = useMemo(
    () => (chain.identityNetwork ? allEndpoints.find((item) => item.key === chain.identityNetwork) : undefined),
    [chain.identityNetwork]
  );
  const apiSystemPeople = useApiUrl(peopleEndpoint?.wsUrl);

  const value = useMemo<ApiProps>(
    () =>
      objectSpread({}, state, {
        api,
        apiError,
        wsUrl: chain.wsUrl,
        isApiConnected,
        isApiInitialized: !!isApiInitialized,
        network: chain.key,
        genesisHash: chain.genesisHash,
        chain,
        apiUrl: chain.wsUrl,
        identityApi: (chain.identityNetwork && apiSystemPeople) || api
      }),
    [state, apiError, chain, isApiConnected, isApiInitialized, apiSystemPeople]
  );

  // initial initialization
  useEffect((): void => {
    const onError = (error: unknown): void => {
      console.error(error);

      setApiError((error as Error).message);
    };

    createApi(chain.wsUrl, onError).then(() => {
      api.on('connected', () => setIsApiConnected(true));
      api.on('disconnected', () => setIsApiConnected(false));
      api.on('error', onError);
      api.on('ready', (): void => {
        loadOnReady(api, chain).then(setState).catch(onError);
      });
      setIsApiInitialized(true);
    });

    setIsApiInitialized(false);
  }, [chain]);

  return <ApiCtx.Provider value={value}>{children}</ApiCtx.Provider>;
}
