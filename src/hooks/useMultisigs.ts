// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';
import type { AccountData, MultiAccountData, ProxyAccountData } from './types';

import { events } from '@mimir-wallet/events';
import { service } from '@mimir-wallet/utils';
import keyring from '@polkadot/ui-keyring';
import { u8aEq, u8aToHex } from '@polkadot/util';
import { encodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';
import { useEffect } from 'react';

import { useApi } from './useApi';

function mergeProxy(api: ApiPromise, account: ProxyAccountData, multisigs: Record<HexString, AccountData>) {
  const { address: addressHex, creator, delegators, height, index, isMimir, isValid, name, networks } = account;
  const address = encodeAddress(addressHex);

  if (networks.find((item) => u8aEq(api.genesisHash.toHex(), item))) {
    const multiAddress = delegators.at(0)?.address;
    let multiAccount: AccountData;

    if (multiAddress && (multiAccount = multisigs[multiAddress]) && multiAccount.type === 'multi') {
      const { threshold, who } = multiAccount as MultiAccountData;

      const exists = keyring.getAccount(address);

      if (exists) {
        keyring.saveAccountMeta(keyring.getPair(address), {
          isMimir,
          isMultisig: true,
          isFlexible: true,
          name: name || undefined,
          who: who.map(({ address }) => encodeAddress(address)),
          threshold,
          creator: encodeAddress(creator),
          height,
          index,
          genesisHash: api.genesisHash.toHex(),
          isValid,
          isPending: false
        });
      } else {
        keyring.addExternal(address, {
          isMimir,
          isMultisig: true,
          isFlexible: true,
          name: name || undefined,
          who: who.map(({ address }) => encodeAddress(address)),
          threshold,
          creator: encodeAddress(creator),
          height,
          index,
          genesisHash: api.genesisHash.toHex(),
          isValid,
          isPending: false
        });
      }

      events.emit('account_meta_changed', address);
    }
  }
}

function mergeMulti(account: MultiAccountData) {
  const { isValid, name, threshold, who } = account;

  const address = encodeMultiAddress(
    who.map(({ address }) => address),
    threshold
  );
  const exists = keyring.getAccount(address);

  keyring.addMultisig(
    who.map(({ address }) => encodeAddress(address)),
    threshold,
    {
      ...exists?.meta,
      isMultisig: true,
      name: name || undefined,
      isValid,
      isPending: false
    }
  );
  events.emit('account_meta_changed', address);
}

function sync(api: ApiPromise) {
  service.getMultisigs(keyring.getAccounts().map((item) => u8aToHex(item.publicKey))).then((multisigs) => {
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
        mergeMulti(data as MultiAccountData);
      }
    });
  });
}

export function useSyncMultisigs() {
  const { api, isApiReady } = useApi();

  useEffect(() => {
    let unsub: (() => void) | undefined;

    if (isApiReady) {
      api.rpc.chain
        .subscribeFinalizedHeads(() => {
          sync(api);
        })
        .then((_unsub) => {
          unsub = _unsub;
        });
    }

    return () => {
      unsub?.();
    };
  }, [api, isApiReady]);
}
