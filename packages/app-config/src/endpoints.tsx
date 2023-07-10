// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LogoKusama, LogoPolkadot } from './icons';
import { EndpointOption } from './types';

export const endpoints: EndpointOption[] = [
  {
    logo: <LogoPolkadot sx={{ width: 84, height: 'auto' }} />,
    specName: 'polkadot',
    providers: {
      'Automata 1RPC': 'wss://1rpc.io/dot',
      Dwellir: 'wss://polkadot-rpc.dwellir.com',
      'Dwellir Tunisia': 'wss://polkadot-rpc-tn.dwellir.com',
      'IBP-GeoDNS1': 'wss://rpc.ibp.network/polkadot',
      'IBP-GeoDNS2': 'wss://rpc.dotters.network/polkadot',
      OnFinality: 'wss://polkadot.api.onfinality.io/public-ws',
      Parity: 'wss://rpc.polkadot.io',
      RadiumBlock: 'wss://polkadot.public.curie.radiumblock.co/ws'
    },
    server: 'http://localhost:8080/',
    text: 'Polkadot'
  },
  {
    logo: <LogoKusama sx={{ width: 84, height: 'auto' }} />,
    specName: 'kusama',
    providers: {
      'Automata 1RPC': 'wss://1rpc.io/ksm',
      Dwellir: 'wss://kusama-rpc.dwellir.com',
      'Dwellir Tunisia': 'wss://kusama-rpc-tn.dwellir.com',
      'IBP-GeoDNS1': 'wss://rpc.ibp.network/kusama',
      'IBP-GeoDNS2': 'wss://rpc.dotters.network/kusama',
      LuckyFriday: 'wss://rpc-kusama.luckyfriday.io',
      OnFinality: 'wss://kusama.api.onfinality.io/public-ws',
      Parity: 'wss://kusama-rpc.polkadot.io',
      RadiumBlock: 'wss://kusama.public.curie.radiumblock.co/ws',
      Stakeworld: 'wss://ksm-rpc.stakeworld.io'
    },
    server: 'http://localhost:8080/',
    text: 'Kusama'
  }
];

export function findEndpoint(specName: string): EndpointOption | undefined {
  return endpoints.find(({ specName: s }) => s === specName);
}
