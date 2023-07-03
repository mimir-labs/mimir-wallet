// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box } from '@mui/material';
import { isFunction } from '@polkadot/util';
import React, { useEffect, useState } from 'react';

import { useApi, useDeriveAccountInfo } from '@mimirdev/react-hooks';

import { getAddressName } from './utils';

interface Props {
  defaultName?: string;
  value: AccountId | AccountIndex | Address | string | Uint8Array | null | undefined;
  shorten?: boolean;
}

const displayCache = new Map<string, React.ReactNode>();
const indexCache = new Map<string, string>();
const parentCache = new Map<string, string>();

export function getParentAccount(value: string): string | undefined {
  return parentCache.get(value);
}

function defaultOrAddr(
  defaultName = '',
  _address: AccountId | AccountIndex | Address | string | Uint8Array,
  _accountIndex?: AccountIndex | null,
  shorten = false
): [displayName: React.ReactNode, isAddress: boolean] {
  const accountId = _address.toString();

  if (!accountId) {
    return [defaultName, false];
  }

  const [isAddress, , name] = getAddressName(accountId, null, defaultName);
  const accountIndex = (_accountIndex || '').toString() || indexCache.get(accountId);

  if (isAddress && accountIndex) {
    indexCache.set(accountId, accountIndex);

    return [shorten ? `${accountIndex.slice(0, 6)}...${accountIndex.slice(-6)}` : accountIndex, true];
  }

  return [isAddress ? (shorten ? `${name.slice(0, 6)}...${name.slice(-6)}` : name) : name, isAddress];
}

function defaultOrAddrNode(defaultName = '', address: AccountId | AccountIndex | Address | string | Uint8Array, accountIndex?: AccountIndex | null, shorten = false): React.ReactNode {
  const [node, isAddress] = defaultOrAddr(defaultName, address, accountIndex, shorten);

  return isAddress ? <Box component='span'>{node}</Box> : node;
}

function extractName(address: string, accountIndex?: AccountIndex, defaultName?: string, shorten = false): React.ReactNode {
  const displayCached = displayCache.get(address);

  if (displayCached) {
    return displayCached;
  }

  const [displayName] = defaultOrAddr(defaultName, address, accountIndex, shorten);

  return <Box component='span'>{displayName}</Box>;
}

function extractIdentity(address: string, identity: DeriveAccountRegistration): React.ReactNode {
  const displayName = identity.display;
  const displayParent = identity.displayParent;
  const elem = (
    <Box component='span'>
      <Box component='span'>{displayParent || displayName}</Box>
      {displayParent && <Box component='span' sx={{ opacity: 0.5 }}>{`/${displayName || ''}`}</Box>}
    </Box>
  );

  displayCache.set(address, elem);

  return elem;
}

function AccountName({ defaultName, shorten = false, value }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const info = useDeriveAccountInfo(value);
  const [name, setName] = useState<React.ReactNode>(() => extractName((value || '').toString(), undefined, defaultName));

  // set the actual nickname, local name, accountIndex, accountId
  useEffect((): void => {
    const { accountId, accountIndex, identity, nickname } = info || {};

    const cacheAddr = (accountId || value || '').toString();

    if (identity?.parent) {
      parentCache.set(cacheAddr, identity.parent.toString());
    }

    if (api && isFunction(api.query.identity?.identityOf)) {
      setName(() => (identity?.display ? extractIdentity(cacheAddr, identity) : extractName(cacheAddr, accountIndex, '', shorten)));
    } else if (nickname) {
      setName(nickname);
    } else {
      setName(defaultOrAddrNode(defaultName, cacheAddr, accountIndex, shorten));
    }
  }, [api, defaultName, info, shorten, value]);

  return <>{name}</>;
}

export default React.memo(AccountName);
