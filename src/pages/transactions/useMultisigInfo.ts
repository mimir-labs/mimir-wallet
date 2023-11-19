// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Call, Multisig } from '@polkadot/types/interfaces';
import type { Transaction } from '@mimirdev/hooks/types';

import { useEffect, useState } from 'react';

import { useAddressMeta } from '@mimirdev/hooks';

export function useMultisigInfo(api: ApiPromise, transaction: Transaction): Multisig | undefined {
  const { meta } = useAddressMeta(transaction.sender);
  const [info, setInfo] = useState<Multisig>();

  useEffect(() => {
    if (meta.isMultisig) {
      let call: Call | undefined;
      let multisig: string | undefined;

      if (meta.isFlexible) {
        call = transaction.children[0]?.call;
        multisig = transaction.children[0]?.sender;
      } else {
        call = transaction.call;
        multisig = transaction.sender;
      }

      if (call && multisig) {
        api.query.multisig.multisigs(multisig, call.hash).then((value) => {
          if (value.isSome) {
            setInfo(value.unwrap());
          }
        });
      }
    }
  }, [api, meta, transaction]);

  return info;
}
