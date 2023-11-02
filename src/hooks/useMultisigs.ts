// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { HexString } from '@polkadot/util/types';
import type { AccountData, MultiAccountData, ProxyAccountData } from './types';

import keyring from '@polkadot/ui-keyring';
import { u8aEq } from '@polkadot/util';
import { encodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';
import { useEffect } from 'react';
import useSWR from 'swr';

import { getServiceUrl } from '@mimirdev/utils/service';

import { useAccounts } from './useAccounts';
import { useApi } from './useApi';

export function useMultisigs(): [data: Record<HexString, AccountData> | undefined, isLoading: boolean] {
  const accounts = useAccounts();

  const { data, isLoading } = useSWR<Record<HexString, AccountData>>(
    getServiceUrl(accounts.allAccounts.length > 0 ? `multisigs?${accounts.allAccountsHex.map((address) => `addresses=${address}`).join('&')}` : null)
  );

  return [data, isLoading];
}

export function useSyncMultisigs() {
  const { api, isApiReady } = useApi();
  const [multisigs] = useMultisigs();

  useEffect(() => {
    if (!isApiReady || !multisigs) return;

    const proxiedMultiAddress: Record<HexString, boolean> = {};

    // sync flexible multisig
    for (const [, account] of Object.entries(multisigs)) {
      if (account.type !== 'proxy') {
        continue;
      }

      const { address: addressHex, creator, delegators, height, index, name, networks } = account as ProxyAccountData;

      const address = encodeAddress(addressHex);

      if (networks.find((item) => u8aEq(api.genesisHash.toHex(), item))) {
        const multiAddress = delegators.at(0)?.address;
        let multiAccount: AccountData;

        if (multiAddress && (multiAccount = multisigs[multiAddress]) && multiAccount.type === 'multi') {
          const { threshold, who } = multiAccount as MultiAccountData;

          proxiedMultiAddress[multiAddress] = true;

          keyring.addExternal(address, {
            isMultisig: true,
            isFlexible: true,
            name: name || undefined,
            who: who.map(({ address }) => encodeAddress(address)),
            threshold,
            creator: encodeAddress(creator),
            height,
            index,
            genesisHash: api.genesisHash.toHex()
          });
        }
      }
    }

    // sync static multisig
    for (const [, account] of Object.entries(multisigs)) {
      if (account.type !== 'multi' || proxiedMultiAddress[account.address]) {
        continue;
      }

      const { isValid, name, threshold, who } = account as MultiAccountData;

      if (isValid) {
        keyring.addMultisig(
          who.map(({ address }) => encodeAddress(address)),
          threshold,
          {
            isMultisig: true,
            name: name || undefined
          }
        );
      } else {
        keyring.forgetAccount(
          encodeMultiAddress(
            who.map(({ address }) => encodeAddress(address)),
            threshold
          )
        );
      }
    }
  }, [api, isApiReady, multisigs]);
}
