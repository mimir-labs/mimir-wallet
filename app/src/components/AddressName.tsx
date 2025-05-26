// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { PalletIdentityJudgement } from '@polkadot/types/lookup';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconIdentity from '@/assets/svg/identity.svg?react';
import { useDeriveAccountInfo } from '@/hooks/useDeriveAccountInfo';
import { hexToU8a } from '@polkadot/util';
import React, { useEffect, useMemo, useState } from 'react';

import { addressEq, encodeAddress, useApi } from '@mimir-wallet/polkadot-core';
import { Tooltip } from '@mimir-wallet/ui';

interface Props {
  defaultName?: string;
  value: AccountId | AccountIndex | Address | string | Uint8Array | null | undefined;
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
    <span className='inline-flex items-center'>
      <Tooltip
        color='foreground'
        content={isGood ? 'Reasonable Identity' : isBad ? 'Bad Identity' : 'Unknown Identity'}
      >
        <IconIdentity
          width='1em'
          height='1em'
          style={{ marginRight: '0.2em' }}
          data-is-bad={isBad}
          data-is-good={isGood}
          className='text-divider-300 data-[is-bad=true]:text-danger data-[is-good=true]:text-primary'
        />
      </Tooltip>
      <span>{displayParent || displayName}</span>
      {displayParent && <span>/</span>}
      {displayParent && <span style={{ opacity: 0.5 }}>{displayName}</span>}
    </span>
  );

  return elem;
}

function AddressName({ defaultName, value }: Props): React.ReactElement<Props> {
  const { chainSS58 } = useApi();
  const address = useMemo(() => encodeAddress(value, chainSS58), [value, chainSS58]);

  const [identity, isFetched, isFetching, identityEnabled] = useDeriveAccountInfo(address);
  const [chainName, setChainName] = useState<React.ReactNode>(null);
  const { meta } = useAddressMeta(address);
  const isZeroAddress = useMemo(() => addressEq(hexToU8a('0x0', 256), address), [address]);

  // set the actual nickname, local name, accountId
  useEffect((): void => {
    const { display, displayParent, judgements } = identity || {};

    const cacheAddr = address.toString();

    if (display && judgements) {
      setChainName(() => (display ? extractIdentity(cacheAddr, display, judgements, displayParent) : null));
    }

    if (!display) {
      setChainName(null);
    }
  }, [address, identity]);

  if (isZeroAddress) {
    return <>ZeroAddress</>;
  }

  return (
    <span data-loading={identityEnabled && !isFetched && !isFetching} className='data-[loading=true]:animate-pulse'>
      {chainName || meta?.name || defaultName || address.slice(0, 8).toUpperCase()}
    </span>
  );
}

export default React.memo(AddressName);
