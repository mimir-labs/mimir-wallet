// Copyright 2023-2025 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressMeta } from '@/hooks/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import type { PalletIdentityJudgement } from '@polkadot/types/lookup';

import {
  addressEq,
  encodeAddress,
  isPolkadotEvmAddress,
  sub2Eth,
  useSs58Format,
  zeroAddress
} from '@mimir-wallet/polkadot-core';
import { Tooltip } from '@mimir-wallet/ui';
import React, { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { useAddressMeta } from '@/accounts/useAddressMeta';
import IconIdentity from '@/assets/svg/identity.svg?react';
import { useDeriveAccountInfo } from '@/hooks/useDeriveAccountInfo';

interface Props {
  defaultName?: string;
  value: AccountId | AccountIndex | Address | string | Uint8Array | null | undefined;
  /** Optional meta to avoid redundant useAddressMeta calls */
  meta?: AddressMeta;
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
    <>
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
          className='AddressIdentity_icon text-divider data-[is-bad=true]:text-danger data-[is-good=true]:text-primary inline align-middle'
        />
      </Tooltip>
      {displayParent || displayName}
      {displayParent && <>/</>}
      {displayParent && <span style={{ opacity: 0.5 }}>{displayName}</span>}
    </>
  );

  return elem;
}

function AddressName({ defaultName, value, meta: propMeta }: Props): React.ReactElement<Props> {
  const { ss58: chainSS58 } = useSs58Format();
  const address = useMemo(() => encodeAddress(value, chainSS58), [value, chainSS58]);

  // Track visibility to defer identity fetching until component is in viewport
  // triggerOnce ensures inView stays true after first intersection
  const { ref, inView } = useInView({ triggerOnce: true });

  // Only fetch identity when component has been visible
  const [identity, isFetched, isFetching] = useDeriveAccountInfo(inView ? address : undefined);
  // Use prop meta if provided, otherwise fetch it (for backward compatibility)
  const { meta: fetchedMeta } = useAddressMeta(propMeta ? undefined : address);
  const meta = propMeta || fetchedMeta;
  const isZeroAddress = useMemo(() => addressEq(zeroAddress, address), [address]);

  // Derive chain name from identity
  const chainName = useMemo(() => {
    const { display, displayParent, judgements } = identity || {};

    if (display && judgements) {
      const cacheAddr = address.toString();

      return extractIdentity(cacheAddr, display, judgements, displayParent);
    }

    return null;
  }, [address, identity]);

  const fallbackName = useMemo(() => {
    if (isPolkadotEvmAddress(address)) {
      return sub2Eth(address)?.slice(0, 8).toUpperCase();
    }

    return address.slice(0, 8).toUpperCase();
  }, [address]);

  if (isZeroAddress) {
    return <>ZeroAddress</>;
  }

  return (
    <span ref={ref} data-loading={!isFetched && isFetching} className='data-[loading=true]:animate-pulse'>
      {chainName || meta?.name || defaultName || fallbackName}
    </span>
  );
}

export default React.memo(AddressName);
