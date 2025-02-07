// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Bytes, Data, Option, Vec } from '@polkadot/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { PalletIdentityJudgement, PalletIdentityRegistration } from '@polkadot/types/lookup';
import type { ITuple } from '@polkadot/types/types';

import { blake2AsHex } from '@polkadot/util-crypto';
import { useQuery } from '@tanstack/react-query';

import { dataToUtf8 } from '@mimir-wallet/utils';

import { createNamedHook } from './createNamedHook';
import { useApi } from './useApi';

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

async function getIdentityInfo({
  queryKey: [api, value]
}: {
  queryKey: [api?: ApiPromise | null, value?: string | null];
}) {
  if (!api || !value) {
    throw new Error('api or value is required');
  }

  let identity = (await api.query.identity.identityOf(value)) as unknown as Option<
    ITuple<[PalletIdentityRegistration, Option<Bytes>]>
  >;

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

  if (identity.isSome) {
    display = dataToUtf8(identity.unwrap()[0].info.display);
  } else {
    const superOf = await api.query.identity.superOf(value);

    if (superOf.isSome) {
      display = dataToUtf8(superOf.unwrap()[1]);
      const superIdentity = (await api.query.identity.identityOf(superOf.unwrap()[0])) as unknown as Option<
        ITuple<[PalletIdentityRegistration, Option<Bytes>]>
      >;

      identity = superIdentity;
      displayParent = dataToUtf8(superIdentity.unwrap()[0].info.display);
    }
  }

  if (identity.isSome) {
    const info = identity.unwrap()[0].info;

    judgements = identity.unwrap()[0].judgements.map((item) => item[1]);

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
