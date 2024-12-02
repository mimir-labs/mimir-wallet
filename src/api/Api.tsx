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

import { ApiCtx, DEFAULT_AUX, statics } from './defaults';

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

const EMPTY_STATE = { hasInjectedAccounts: false, isApiReady: false } as unknown as ApiState;

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

    statics.api = new ApiPromise({
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
        api: statics.api,
        apiError,
        wsUrl: chain.wsUrl,
        isApiConnected,
        isApiInitialized: !!isApiInitialized,
        network: chain.key,
        genesisHash: chain.genesisHash,
        chain,
        apiUrl: chain.wsUrl,
        identityApi: (chain.identityNetwork && apiSystemPeople) || statics.api
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
      statics.api.on('connected', () => setIsApiConnected(true));
      statics.api.on('disconnected', () => setIsApiConnected(false));
      statics.api.on('error', onError);
      statics.api.on('ready', (): void => {
        loadOnReady(statics.api, chain).then(setState).catch(onError);
      });
      setIsApiInitialized(true);
    });

    setIsApiInitialized(false);
  }, [chain]);

  return <ApiCtx.Provider value={value}>{children}</ApiCtx.Provider>;
}
