// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Bytes, Data, Option, Vec } from '@polkadot/types';
import type {
  PalletIdentityJudgement,
  PalletIdentityRegistration,
} from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import {
  addressToHex,
  ApiManager,
  useChains,
  useNetwork,
  useSs58Format,
} from '@mimir-wallet/polkadot-core';
import { useQuery } from '@mimir-wallet/service';
import { useEffect, useMemo } from 'react';
import { create } from 'zustand';

import { dataToUtf8 } from '@/utils';

type AccountInfo = {
  display: string | undefined;
  displayParent: string | undefined;
  discord: string | undefined;
  email: string | undefined;
  github: string | undefined;
  image: string | undefined;
  element: string | undefined;
  judgements: PalletIdentityJudgement[] | undefined;
  legal: string | undefined;
  matrix: string | undefined;
  other: Record<string, string> | undefined;
  riot: string | undefined;
  twitter: string | undefined;
  web: string | undefined;
};

function extractOther(additional: Vec<ITuple<[Data, Data]>>) {
  return additional.reduce<Record<string, string>>((other, [_key, _value]) => {
    const key = dataToUtf8(_key);
    const value = dataToUtf8(_value);

    if (key && value) {
      other[key] = value;
    }

    return other;
  }, {});
}

function identityCompat(
  identityOfOpt:
    | Option<ITuple<[PalletIdentityRegistration, Option<Bytes>]>>
    | Option<PalletIdentityRegistration>,
): PalletIdentityRegistration {
  const identity = identityOfOpt.unwrap();

  return Array.isArray(identity) ? identity[0] : identity;
}

async function getIdentityInfo({
  queryKey: [api, value],
}: {
  queryKey: [api?: ApiPromise | null, value?: string | null];
}) {
  if (!(api && value)) {
    throw new Error('api or value is required');
  }

  const identity = await api.query.identity.identityOf(value);

  let display: string | undefined;
  let displayParent: string | undefined;
  let discord: string | undefined;
  let email: string | undefined;
  let github: string | undefined;
  let image: string | undefined;
  let judgements: PalletIdentityJudgement[] | undefined;
  let legal: string | undefined;
  let matrix: string | undefined;
  let element: string | undefined;
  let other: Record<string, string> | undefined;
  let riot: string | undefined;
  let twitter: string | undefined;
  let web: string | undefined;

  let final: PalletIdentityRegistration | undefined;

  if (identity.isSome) {
    final = identityCompat(identity);

    display = dataToUtf8(final.info.display);
  } else {
    const superOf = await api.query.identity.superOf(value);

    if (superOf.isSome) {
      display = dataToUtf8(superOf.unwrap()[1]);
      const superIdentity = await api.query.identity.identityOf(
        superOf.unwrap()[0],
      );

      final = identityCompat(superIdentity);

      displayParent = dataToUtf8(final.info.display);
    }
  }

  if (final) {
    const info = final.info;

    judgements = final.judgements.map((item) => item[1]);

    discord = dataToUtf8(info.getT('discord'));
    email = dataToUtf8(info.email);
    github = dataToUtf8(info.getT('github'));
    image = dataToUtf8(info.image);
    legal = dataToUtf8(info.legal);
    matrix = dataToUtf8(info.getT('matrix'));
    element = dataToUtf8(info.getT('element'));
    other = info.additional ? extractOther(info.additional) : {};
    riot = dataToUtf8(info.riot);
    twitter = dataToUtf8(info.twitter);
    web = dataToUtf8(info.web);
  }

  return {
    display,
    displayParent,
    discord,
    email,
    github,
    image,
    element,
    judgements,
    legal,
    matrix,
    other,
    riot,
    twitter,
    web,
  };
}

async function fetchIdentityInfo({
  queryKey,
}: {
  queryKey: readonly [string, string, string];
}) {
  const [, network, addressHex] = queryKey;

  // getIdentityApi resolves the identity network internally
  const api = await ApiManager.getInstance().getIdentityApi(network);

  return getIdentityInfo({ queryKey: [api, addressHex] });
}

export const useIdentityStore = create<Record<HexString, string>>()(() => ({}));

export function useDeriveAccountInfo(
  value?: string | null,
): [data: AccountInfo | undefined, isFetched: boolean, isFetching: boolean] {
  const { network } = useNetwork();
  const { mode } = useChains();
  const { chainInfo } = useSs58Format();

  const address = value ? value.toString() : '';
  const addressHex = useMemo(
    () => (address ? addressToHex(address) : '0x'),
    [address],
  );

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [
      'identity-info',
      mode === 'omni' ? chainInfo.key : network,
      addressHex,
    ] as const,
    refetchInterval: 12000,
    refetchOnMount: false,
    queryFn: fetchIdentityInfo,
    enabled: !!address,
  });

  useEffect(() => {
    if (data && data.display && value) {
      const display = data.displayParent
        ? `${data.displayParent}/${data.display}`
        : data.display;

      useIdentityStore.setState({
        [addressHex]: display,
      });
    }
  }, [data, value, addressHex]);

  return [data, isFetched, isFetching] as const;
}
