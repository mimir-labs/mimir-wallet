// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';
import type { AccountData, MultiAccountData, ProxyAccountData } from './types';

import keyring from '@polkadot/ui-keyring';
import { u8aEq, u8aToHex } from '@polkadot/util';
import { encodeMultiAddress } from '@polkadot/util-crypto';
import { useEffect, useMemo, useState } from 'react';

import { events } from '@mimir-wallet/events';
import { addressToHex, service } from '@mimir-wallet/utils';

import { useApi } from './useApi';
import { useGroupAccounts } from './useGroupAccounts';

function mergeProxy(api: ApiPromise, account: ProxyAccountData, multisigs: Record<HexString, AccountData>) {
  const { address: addressHex, creator, delegators, height, index, isMimir, name, networks } = account;
  const address = keyring.encodeAddress(addressHex, api.registry.chainSS58);

  if (networks.find((item) => u8aEq(api.genesisHash.toHex(), item))) {
    const multiAddress = delegators.at(0)?.address;

    if (multiAddress) {
      const multiAccount: AccountData = multisigs[multiAddress];

      if (multiAccount && multiAccount.type === 'multi') {
        const { threshold, who } = multiAccount as MultiAccountData;

        const exists = keyring.getAccount(address);
        const _meta = {
          isMimir,
          isMultisig: true,
          isFlexible: true,
          name: name || undefined,
          who: who.map(({ address }) => keyring.encodeAddress(address)).sort((l, r) => (l > r ? 1 : -1)),
          threshold,
          creator: keyring.encodeAddress(creator),
          height,
          index,
          genesisHash: api.genesisHash.toHex(),
          isPending: false
        };

        if (exists) {
          if (
            exists.meta.isMimir !== _meta.isMimir ||
            exists.meta.isMultisig !== _meta.isMultisig ||
            exists.meta.isFlexible !== _meta.isFlexible ||
            exists.meta.name !== _meta.name ||
            exists.meta.who?.sort((l, r) => (l > r ? 1 : -1)).join('') !== _meta.who.join('') ||
            exists.meta.threshold !== _meta.threshold ||
            exists.meta.creator !== _meta.creator ||
            exists.meta.height !== _meta.height ||
            exists.meta.index !== _meta.index ||
            exists.meta.genesisHash !== _meta.genesisHash ||
            exists.meta.isPending !== _meta.isPending
          ) {
            keyring.saveAccountMeta(keyring.getPair(address), _meta);
            events.emit('account_meta_changed', address);
          }
        } else {
          keyring.addExternal(address, _meta);
          events.emit('account_meta_changed', address);
        }
      }
    }
  }
}

function mergeMulti(api: ApiPromise, account: MultiAccountData) {
  const { name, threshold, who } = account;

  const address = encodeMultiAddress(
    who.map(({ address }) => address),
    threshold,
    api.registry.chainSS58
  );

  const exists = keyring.getAccount(address);

  if (!exists) {
    keyring.addExternal(address, {
      isMultisig: true,
      threshold,
      who: who.map(({ address }) => keyring.encodeAddress(address)).sort((l, r) => (l > r ? 1 : -1)),
      name: name || undefined,
      isPending: false
    });
    events.emit('account_meta_changed', address);
  } else {
    keyring.saveAccountMeta(keyring.getPair(address), {
      isMultisig: true,
      threshold,
      who: who.map(({ address }) => keyring.encodeAddress(address)).sort((l, r) => (l > r ? 1 : -1)),
      name: name || undefined,
      isPending: false
    });
    events.emit('account_meta_changed', address);
  }
}

async function sync(api: ApiPromise, key: string): Promise<void> {
  const addresses = key.split(',');

  const multisigs = await service.getMultisigs(addresses);

  // remove not exist multisig but not in pending
  keyring.getAccounts().forEach((account) => {
    if (!account.meta.isPending && account.meta.isMultisig && !multisigs[u8aToHex(account.publicKey)]) {
      keyring.forgetAccount(account.address);
    }
  });

  Object.values(multisigs).forEach((data) => {
    if (data.type === 'proxy') {
      mergeProxy(api, data as ProxyAccountData, multisigs);
    }

    if (data.type === 'multi') {
      mergeMulti(api, data as MultiAccountData);
    }
  });
}

export function useSyncMultisigs(isWalletReady: boolean): boolean {
  const { api, isApiReady } = useApi();
  const { accounts, injected, testing } = useGroupAccounts();
  const [syned, setSyned] = useState(false);
  const queryKey = useMemo(
    () =>
      accounts
        .concat(injected)
        .concat(testing)
        .map((item) => addressToHex(item))
        .sort((l, r) => (l > r ? 1 : -1))
        .join(','),
    [accounts, injected, testing]
  );

  useEffect(() => {
    let unsubPromise: Promise<() => void> | undefined;

    if (isWalletReady && isApiReady) {
      unsubPromise = api.rpc.chain.subscribeFinalizedHeads(() => {
        sync(api, queryKey).then(() => setSyned(true));
      });
    }

    return () => {
      unsubPromise?.then((unsub) => unsub());
    };
  }, [api, queryKey, isApiReady, isWalletReady]);

  return syned;
}
