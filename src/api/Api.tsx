// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ChainProperties, ChainType } from '@polkadot/types/interfaces';
import type { KeyringStore } from '@polkadot/ui-keyring/types';
import type { ApiProps, ApiState } from './types';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { deriveMapCache, setDeriveCache } from '@polkadot/api-derive/util';
import { keyring } from '@polkadot/ui-keyring';
import { formatBalance, isTestChain, objectSpread, stringify } from '@polkadot/util';
import { defaults as addressDefaults } from '@polkadot/util-crypto/address/defaults';
import React, { useEffect, useMemo, useState } from 'react';

import { registry } from './typeRegistry';

interface Props {
  children: React.ReactNode;
  apiUrl: string;
  store: KeyringStore | undefined;
}

interface ChainData {
  properties: ChainProperties;
  systemChain: string;
  systemChainType: ChainType;
  systemName: string;
  systemVersion: string;
}

export const DEFAULT_DECIMALS = registry.createType('u32', 12);
export const DEFAULT_SS58 = registry.createType('u32', addressDefaults.prefix);
export const DEFAULT_AUX = ['Aux1', 'Aux2', 'Aux3', 'Aux4', 'Aux5', 'Aux6', 'Aux7', 'Aux8', 'Aux9'];

export const ApiCtx = React.createContext<ApiProps>({} as unknown as ApiProps);

const EMPTY_STATE = { hasInjectedAccounts: false, isApiReady: false } as unknown as ApiState;

let api: ApiPromise;

export { api, registry };

function isKeyringLoaded() {
  try {
    return !!keyring.keyring;
  } catch {
    return false;
  }
}

async function retrieve(api: ApiPromise): Promise<ChainData> {
  const [systemChain, systemChainType, systemName, systemVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.chainType ? api.rpc.system.chainType() : Promise.resolve(registry.createType('ChainType', 'Live')),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  return {
    properties: registry.createType('ChainProperties', {
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

async function loadOnReady(api: ApiPromise, store: KeyringStore | undefined): Promise<ApiState> {
  const { properties, systemChain, systemChainType, systemName, systemVersion } = await retrieve(api);
  const chainSS58 = properties.ss58Format.unwrapOr(DEFAULT_SS58).toNumber();
  const ss58Format = chainSS58;
  const tokenSymbol = properties.tokenSymbol.unwrapOr([formatBalance.getDefaults().unit, ...DEFAULT_AUX]);
  const tokenDecimals = properties.tokenDecimals.unwrapOr([DEFAULT_DECIMALS]);
  const isDevelopment = systemChainType.isDevelopment || systemChainType.isLocal || isTestChain(systemChain);

  console.log(`chain: ${systemChain} (${systemChainType.toString()}), ${stringify(properties)}`);

  // explicitly override the ss58Format as specified
  registry.setChainProperties(registry.createType('ChainProperties', { ss58Format, tokenDecimals, tokenSymbol }));

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

  // finally load the keyring
  isKeyringLoaded() ||
    keyring.loadAll({
      genesisHash: api.genesisHash,
      isDevelopment,
      ss58Format,
      store,
      type: 'ed25519'
    });

  return {
    apiDefaultTx,
    apiDefaultTxSudo,
    chainSS58,
    isApiReady: true,
    isDevelopment,
    specName: api.runtimeVersion.specName.toString(),
    specVersion: api.runtimeVersion.specVersion.toString(),
    systemChain,
    systemName,
    systemVersion,
    tokenSymbol: tokenSymbol[0].toString()
  };
}

/**
 * @internal
 */
function createApi(apiUrl: string, onError: (error: unknown) => void): void {
  try {
    const provider = new WsProvider(apiUrl);

    api = new ApiPromise({ provider, registry });
  } catch (error) {
    onError(error);
  }
}

export function ApiCtxRoot({ apiUrl, children, store }: Props): React.ReactElement<Props> | null {
  const [state, setState] = useState<ApiState>(EMPTY_STATE);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isApiInitialized, setIsApiInitialized] = useState(false);
  const [apiError, setApiError] = useState<null | string>(null);
  const value = useMemo<ApiProps>(() => objectSpread({}, state, { api, apiError, apiUrl, isApiConnected, isApiInitialized }), [apiError, isApiConnected, isApiInitialized, state, apiUrl]);

  // initial initialization
  useEffect((): void => {
    const onError = (error: unknown): void => {
      console.error(error);

      setApiError((error as Error).message);
    };

    createApi(apiUrl, onError);
    api.on('connected', () => setIsApiConnected(true));
    api.on('disconnected', () => setIsApiConnected(false));
    api.on('error', onError);
    api.on('ready', (): void => {
      loadOnReady(api, store).then(setState).catch(onError);
    });

    setIsApiInitialized(true);
  }, [apiUrl, store]);

  if (!value.isApiInitialized) {
    return null;
  }

  return <ApiCtx.Provider value={value}>{children}</ApiCtx.Provider>;
}
