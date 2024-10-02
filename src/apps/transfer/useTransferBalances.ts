// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { TransferToken } from './types';

import { BN, BN_ZERO } from '@polkadot/util';
import { useEffect, useMemo, useState } from 'react';

import { useApi } from '@mimir-wallet/hooks';

function _listenNativeBalance(api: ApiPromise, address: string, setBalance: (value: BN) => void): Promise<() => void> {
  return api.derive.balances.all(address, (result) => {
    setBalance(result.availableBalance);
  });
}

function _listenAssetBalance(
  api: ApiPromise,
  address: string,
  assetId: string,
  setBalance: (value: BN) => void
): Promise<() => void> {
  return api.query.assets.account(assetId, address, (result) => {
    setBalance(result.unwrapOrDefault().balance);
  });
}

export function useTransferBalance(
  token?: TransferToken,
  sender?: string,
  recipient?: string
): [format: [decimals: number, unit: string], sendingBalance: BN, recipientBalance: BN] {
  const { api } = useApi();
  const [sendingBalance, setSendingBalance] = useState<BN>(BN_ZERO);
  const [recipientBalance, setRecipientBalance] = useState<BN>(BN_ZERO);

  useEffect(() => {
    const unsubPromises: Array<Promise<() => void>> = [];

    if (token) {
      if (token.isNative) {
        if (sender) {
          unsubPromises.push(_listenNativeBalance(api, sender, setSendingBalance));
        }

        if (recipient) {
          unsubPromises.push(_listenNativeBalance(api, recipient, setRecipientBalance));
        }
      } else {
        const { assetId } = token;

        if (sender) {
          unsubPromises.push(_listenAssetBalance(api, sender, assetId, setSendingBalance));
        }

        if (recipient) {
          unsubPromises.push(_listenAssetBalance(api, recipient, assetId, setRecipientBalance));
        }
      }
    }

    return () => {
      unsubPromises.forEach((promise) => promise.then((unsub) => unsub()));
    };
  }, [api, recipient, sender, token]);

  return useMemo(
    () => [token ? [token.decimals, token.symbol] : [0, ''], sendingBalance, recipientBalance],
    [recipientBalance, sendingBalance, token]
  );
}
