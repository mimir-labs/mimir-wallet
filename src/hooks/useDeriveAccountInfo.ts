// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Data, Vec } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { PalletIdentityJudgement } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';

import { u8aToString } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';
import { useQuery } from '@tanstack/react-query';

import { createNamedHook } from './createNamedHook';
import { useApi } from './useApi';

function dataAsString(data: Data) {
  if (!data) {
    return data;
  }

  return data.isRaw ? u8aToString(data.asRaw.toU8a(true)) : data.isNone ? undefined : data.toHex();
}

function extractOther(additional: Vec<ITuple<[Data, Data]>>) {
  return additional.reduce<Record<string, string>>((other, [_key, _value]) => {
    const key = dataAsString(_key);
    const value = dataAsString(_value);

    if (key && value) {
      other[key] = value;
    }

    return other;
  }, {});
}

async function getIdentityInfo({
  queryKey: [api, value]
}: {
  queryKey: [api?: ApiPromise | null, value?: string | null];
}) {
  if (!api || !value) {
    throw new Error('api or value is required');
  }

  let identity = await api.query.identity.identityOf(value);

  let display: string | undefined;
  let displayParent: string | undefined;
  let discord: string | undefined;
  let email: string | undefined;
  let github: string | undefined;
  let image: string | undefined;
  let judgements: PalletIdentityJudgement[] | undefined;
  let legal: string | undefined;
  let matrix: string | undefined;
  let other: Record<string, string> | undefined;
  let riot: string | undefined;
  let twitter: string | undefined;
  let web: string | undefined;

  if (identity.isSome) {
    display = dataAsString(identity.unwrap()[0].info.display);
  } else {
    const superOf = await api.query.identity.superOf(value);

    if (superOf.isSome) {
      display = dataAsString(superOf.unwrap()[1]);
      const superIdentity = await api.query.identity.identityOf(superOf.unwrap()[0]);

      identity = superIdentity;
      displayParent = dataAsString(superIdentity.unwrap()[0].info.display);
    }
  }

  if (identity.isSome) {
    const info = identity.unwrap()[0].info;

    judgements = identity.unwrap()[0].judgements.map((item) => item[1]);

    discord = dataAsString(info.getT('discord'));
    email = dataAsString(info.email);
    github = dataAsString(info.getT('github'));
    image = dataAsString(info.image);
    legal = dataAsString(info.legal);
    matrix = dataAsString(info.getT('matrix'));
    other = info.additional ? extractOther(info.additional) : {};
    riot = dataAsString(info.riot);
    twitter = dataAsString(info.twitter);
    web = dataAsString(info.web);
  }

  return {
    display,
    displayParent,
    discord,
    email,
    github,
    image,
    judgements,
    legal,
    matrix,
    other,
    riot,
    twitter,
    web
  };
}

function useDeriveAccountInfoImpl(value?: AccountId | AccountIndex | Address | Uint8Array | string | null) {
  const { identityApi } = useApi();
  const queryHash = blake2AsHex(`${identityApi?.genesisHash.toHex()}-identity-info-${value?.toString()}`);

  const { data, isFetched, isFetching } = useQuery({
    queryKey: [identityApi, value?.toString()] as const,
    queryHash,
    refetchInterval: 12000,
    queryFn: getIdentityInfo,
    enabled: !!identityApi && !!identityApi.query?.identity?.identityOf && !!value
  });

  return [data, isFetched, isFetching] as const;
}

export const useDeriveAccountInfo = createNamedHook('useDeriveAccountInfo', useDeriveAccountInfoImpl);
