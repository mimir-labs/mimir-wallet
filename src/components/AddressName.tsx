// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box } from '@mui/material';
import { isFunction } from '@polkadot/util';
import React, { useEffect, useState } from 'react';

import { useAddressMeta, useApi, useDeriveAccountInfo } from '@mimir-wallet/hooks';

interface Props {
  defaultName?: string;
  value: AccountId | AccountIndex | Address | string | Uint8Array | null | undefined;
}

const displayCache = new Map<string, React.ReactNode>();
const parentCache = new Map<string, string>();

export function getParentAccount(value: string): string | undefined {
  return parentCache.get(value);
}

function extractName(address: string): React.ReactNode {
  const displayCached = displayCache.get(address);

  if (displayCached) {
    return displayCached;
  }

  return '';
}

function extractIdentity(address: string, identity: DeriveAccountRegistration): React.ReactNode {
  const displayName = identity.display;
  const { displayParent } = identity;
  const elem = (
    <Box component='span'>
      <Box component='span'>{displayParent || displayName}</Box>
      {displayParent && <Box component='span' sx={{ opacity: 0.5 }}>{`/${displayName || ''}`}</Box>}
    </Box>
  );

  displayCache.set(address, elem);

  return elem;
}

function AddressName({ defaultName, value }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const info = useDeriveAccountInfo(value);
  const [chainName, setChainName] = useState<React.ReactNode>(() => extractName((value || '').toString()));
  const { meta } = useAddressMeta(value?.toString());

  // set the actual nickname, local name, accountId
  useEffect((): void => {
    const { accountId, identity, nickname } = info || {};

    const cacheAddr = (accountId || value || '').toString();

    if (identity?.parent) {
      parentCache.set(cacheAddr, identity.parent.toString());
    }

    if (api && isFunction(api.query.identity?.identityOf)) {
      setChainName(() => (identity?.display ? extractIdentity(cacheAddr, identity) : extractName(cacheAddr)));
    } else if (nickname) {
      setChainName(nickname);
    }
  }, [api, info, value]);

  return <>{chainName || meta?.name || defaultName || `${value?.toString().slice(0, 8).toUpperCase()}`}</>;
}

export default React.memo(AddressName);
