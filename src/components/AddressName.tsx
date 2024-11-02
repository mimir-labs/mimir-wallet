// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

import { Box } from '@mui/material';
import { hexToU8a, isFunction } from '@polkadot/util';
import React, { useEffect, useMemo, useState } from 'react';

import { useAddressMeta, useApi, useDeriveAccountInfo } from '@mimir-wallet/hooks';
import { addressEq } from '@mimir-wallet/utils';

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
  const address = value?.toString() || '';
  const { identityApi } = useApi();
  const info = useDeriveAccountInfo(address);
  const [chainName, setChainName] = useState<React.ReactNode>(() => extractName(address.toString()));
  const { meta } = useAddressMeta(address);
  const isZeroAddress = useMemo(() => addressEq(hexToU8a('0x0', 256), address), [address]);

  // set the actual nickname, local name, accountId
  useEffect((): void => {
    const { accountId, identity, nickname } = info || {};

    const cacheAddr = (accountId || address).toString();

    if (identity?.parent) {
      parentCache.set(cacheAddr, identity.parent.toString());
    }

    if (identityApi && isFunction(identityApi.query.identity?.identityOf)) {
      setChainName(() => (identity?.display ? extractIdentity(cacheAddr, identity) : extractName(cacheAddr)));
    } else if (nickname) {
      setChainName(nickname);
    }
  }, [identityApi, info, address]);

  if (isZeroAddress) {
    return <>ZeroAddress</>;
  }

  return <>{chainName || meta?.name || defaultName || address.slice(0, 8).toUpperCase()}</>;
}

export default React.memo(AddressName);
