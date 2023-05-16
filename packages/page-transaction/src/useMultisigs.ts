// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Option, U8aFixed } from '@polkadot/types';
import type { AccountId32, Multisig } from '@polkadot/types/interfaces';
import type { MultisigState } from './types';

import { useEffect, useState } from 'react';

import { MULTISIG_CALLDATA } from '@mimirdev/app-config/constants';
import { useApi, useGroupAccounts } from '@mimirdev/react-hooks';

function extraMultisigs(values: [[AccountId32, U8aFixed], Option<Multisig>][]): MultisigState[] {
  const multisigs: MultisigState[] = [];

  values.forEach(([[accountId, hash], value]) => {
    const calldata = localStorage.getItem(MULTISIG_CALLDATA);
    const calldataJson = calldata ? JSON.parse(calldata) : {};

    if (value.isSome && calldataJson[hash.toHex()]) {
      const multisig = value.unwrap();

      multisigs.push({
        accountId: accountId.toString(),
        multisig,
        calldata: calldataJson[hash.toHex()]
      });
    }
  });

  return multisigs;
}

async function retrieMultisigs(api: ApiPromise, addresses: string[]): Promise<[[AccountId32, U8aFixed], Option<Multisig>][]> {
  const list = await Promise.all(
    addresses.map((address) => {
      return api.query.multisig.multisigs.entries(address).then((data) => data.map((d): [[AccountId32, U8aFixed], Option<Multisig>] => [d[0].args, d[1]]));
    })
  );

  return list.flat();
}

export function useMultisigs() {
  const { api } = useApi();
  const { multisig } = useGroupAccounts();
  const [multisigs, setMultisigs] = useState<MultisigState[]>();

  useEffect(() => {
    retrieMultisigs(api, multisig).then(extraMultisigs).then(setMultisigs);
  }, [api, multisig]);

  return multisigs;
}
