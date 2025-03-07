// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { PalletIdentityJudgement } from '@polkadot/types/lookup';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import { encodeAddress } from '@/api';
import IconIdentity from '@/assets/svg/identity.svg?react';
import { useDeriveAccountInfo } from '@/hooks/useDeriveAccountInfo';
import { addressEq } from '@/utils';
import { Box, SvgIcon } from '@mui/material';
import { hexToU8a } from '@polkadot/util';
import React, { useEffect, useMemo, useState } from 'react';

interface Props {
  defaultName?: string;
  value: AccountId | AccountIndex | Address | string | Uint8Array | null | undefined;
}

const displayCache = new Map<string, React.ReactNode>();
const parentCache = new Map<string, string>();

function extractName(address: string): React.ReactNode {
  const displayCached = displayCache.get(address);

  if (displayCached) {
    return displayCached;
  }

  return '';
}

function extractIdentity(
  address: string,
  _display: string,
  _judgements: PalletIdentityJudgement[],
  _displayParent?: string
): React.ReactNode {
  const judgements = _judgements.filter((judgement) => !judgement.isFeePaid);
  const isGood = judgements.some((judgement) => judgement.isKnownGood || judgement.isReasonable);
  const isBad = judgements.some((judgement) => judgement.isErroneous || judgement.isLowQuality);

  const displayName = isGood ? _display : (_display || '').replace(/[^\x20-\x7E]/g, '');
  const displayParent = _displayParent && (isGood ? _displayParent : _displayParent.replace(/[^\x20-\x7E]/g, ''));

  const elem = (
    <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <SvgIcon
        component={IconIdentity}
        inheritViewBox
        sx={{
          marginRight: '0.2em',
          color: isBad ? 'error.main' : isGood ? 'primary.main' : 'grey.300',
          fontSize: 'inherit'
        }}
      />
      <Box component='span'>{displayParent || displayName}</Box>
      {displayParent && <span>/</span>}
      {displayParent && (
        <Box component='span' sx={{ opacity: 0.5 }}>
          {displayName}
        </Box>
      )}
    </Box>
  );

  displayCache.set(address, elem);

  return elem;
}

function AddressName({ defaultName, value }: Props): React.ReactElement<Props> {
  const address = useMemo(() => encodeAddress(value), [value]);

  const [identity] = useDeriveAccountInfo(address);
  const [chainName, setChainName] = useState<React.ReactNode>(() => extractName(address.toString()));
  const { meta } = useAddressMeta(address);
  const isZeroAddress = useMemo(() => addressEq(hexToU8a('0x0', 256), address), [address]);

  // set the actual nickname, local name, accountId
  useEffect((): void => {
    const { display, displayParent, judgements } = identity || {};

    const cacheAddr = address.toString();

    if (displayParent) {
      parentCache.set(cacheAddr, displayParent);
    }

    if (display && judgements) {
      setChainName(() =>
        display ? extractIdentity(cacheAddr, display, judgements, displayParent) : extractName(cacheAddr)
      );
    }

    if (!display) {
      setChainName(() => extractName(cacheAddr));
    }
  }, [address, identity]);

  if (isZeroAddress) {
    return <>ZeroAddress</>;
  }

  return <>{chainName || meta?.name || defaultName || address.slice(0, 8).toUpperCase()}</>;
}

export default React.memo(AddressName);
